# File backup with socket.io

Real-time file backup application using [socket.io](https://github.com/socketio/socket.io) and [socket.io-client](https://github.com/socketio/socket.io-client).
### Requisites
1. Node.js (v10+) environment properly installed and configured
2. Angular (v8+)

### Use API
1. Install deps
   ```sh
   ~/api$ npm i
   ```
2. Create <code>/api/.env</code> like <code>/api/.env.example</code> with configs
3. Configure <code>users.json</code>
4. Run server API instance
   ```sh
   ~/api$ npm run api
   ```
5. Run server Socket instance
   ```sh
   ~/api$ npm run socket
   ```

### Use Client
1. Install deps
   ```sh
   ~/client$ npm i
   ```
2. Run client
   ```sh
   ~/client$ ng serve
   ```