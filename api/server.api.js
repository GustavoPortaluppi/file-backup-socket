require('dotenv').config({
  path: '.env',
});

const fs = require('fs');
const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

const { sendEmail } = require('./utils');
const users = require('./users');

app.use(bodyParser.json());
app.use(cors());

app.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const [{ backupPath }] = users.filter(x => x.userId.toString() === userId.toString());

  const files = fs.readdirSync(backupPath);

  res.status(200).json({ files });
});

app.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const [{ email }] = users.filter(x => x.userId.toString() === userId.toString());

  const template = `<h5>WARN</h5><span>System unavailable at ${new Date()}</span>`;

  await sendEmail({ userId, to: email, html: template });

  res.status(200).json({ message: 'Email sent successfully' });
});

app.listen(process.env.API_PORT, () => {
  console.log(`Server is running on port ${process.env.API_PORT}`);
});