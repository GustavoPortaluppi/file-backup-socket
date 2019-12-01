require('dotenv').config({
  path: '.env',
});

const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

const fs = require('fs');
const chokidar = require('chokidar');
const server = require('http').createServer();
const io = require('socket.io')(server);

const { sendEmail } = require('./utils');
const users = require('./users');
let changes = [];

async function addFileBackup({ userId, rootPath, backupPath, path }) {
  console.log(` ${userId} | File ${path} has been added`);

  try {
    const targetPath = `${backupPath}${path.replace(rootPath, '')}`;
    fs.copyFileSync(path, targetPath);
    console.log(` ${userId} | ${targetPath} backup success`);

    /* Salvar evento */
    changes.push({ type: 'ADD', path, date: new Date() });
  } catch (err) {
    console.error(err);
  }
}

async function removeFileBackup({ userId, rootPath, backupPath, path }) {
  console.log(` ${userId} | File ${path} has been removed`);

  try {
    const targetPath = `${backupPath}${path.replace(rootPath, '')}`;
    fs.unlinkSync(targetPath);
    console.log(` ${userId} | ${targetPath} remove success`);

    /* Salvar evento */
    changes.push({ type: 'UNLINK', path, date: new Date() });
  } catch (err) {
    console.error(err);
  }
}

async function removeFileRoot({ rootPath, path }) {
  try {
    const targetPath = `${rootPath}${path}`;
    fs.unlinkSync(targetPath);
  } catch (err) {
    console.error(err);
  }
}

async function notifyEmail(email) {
  if (changes && changes.length > 0) {
    const template = changes.map(x => {
      return `<br>${JSON.stringify(x)}`;
    });

    await sendEmail({ to: email, html: template.join('') });

    changes = [];
  } else {
    console.log(' > Nenhuma alteração encontrada.');
  }
}


/**
 * Monitoramento das conexões do socket.
 * Evento disparado toda vez que um cliente novo se conecta.
 */
io.on('connection', client => {
  const query = client.handshake.query;
  const { userId } = query;

  console.log(`** New connection from ${userId} **`);

  const [{ email, rootPath, backupPath }] = users.filter(x => x.userId.toString() === userId.toString());

  console.log(`** Monitoring ${rootPath} **`);

  /* Create backup folder. */
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath);
  }

  const watcher = chokidar.watch(rootPath, { ignored: /^\./, persistent: true });

  watcher
    .on('add', async (path) => {
      /* Salva arquivo no backup */
      await addFileBackup({ userId, rootPath, backupPath, path });

      /* Notificar criação de arquivo ao cliente atual. */
      client.emit('CHANGE', 'New file has been added');
    })
    .on('change', async (path) => {
      /* Atualizar arquivo no backup */
      await addFileBackup({ userId, rootPath, backupPath, path });

      /* Notificar atualização de arquivo ao cliente atual. */
      client.emit('CHANGE', 'File has been changed');
    })
    .on('unlink', async (path) => {
      /* Remover arquivo no backup */
      await removeFileBackup({ userId, rootPath, backupPath, path });

      /* Notificar remoção de arquivo ao cliente atual. */
      client.emit('CHANGE', 'File has been removed');
    })
    .on('error', (error) => {
      console.error('Error happened', error);
    });

  /* Notificar e-mail a cada 2 minutos caso houveram alterações */
  setInterval(() => notifyEmail(email), 120000);

  /* Monitoramento das mensagens do tipo 'UNLINK' enviadas pelo cliente atual. */
  client.on('UNLINK', async (data) => {
    console.log(` ${userId} | Remove ${data} request`);

    /* Remover arquivo no diretório root */
    await removeFileRoot({ rootPath, path: data });
  });

  /* Monitoramento da desconexão do cliente. */
  client.on('disconnect', () => {
    console.log(`** Client ${userId } disconnected **`);
  });
});

/* Inicialização do serviço na porta 3010. */
server.listen(process.env.SOCKET_PORT, () => {
  console.log(`Server listening on port ${process.env.SOCKET_PORT}`);
});

app.use(bodyParser.json());
app.use(cors());

app.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const [{ backupPath }] = users.filter(x => x.userId.toString() === userId.toString());

  const files = fs.readdirSync(backupPath);

  res.status(200).json(files);
});

app.listen(process.env.API_PORT, () => {
  console.log(`Server is running on port ${process.env.API_PORT}`);
});