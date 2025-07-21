import { WebSocketServer, WebSocket } from "ws";
import http from "node:http";
import EventEmitter from "node:events";
import url from "url";
import { randomUUID } from "node:crypto";
import queryString from "querystring";
import { isUint8Array } from "util/types";
import express from "express";
import { Account, Client, Query } from "node-appwrite";
import {
  APPWRITE_DATABASE,
  APPWRITE_PROFILE_COLLECTION,
  APPWRITE_POSTS_COLLECTION,
  createAdminClient,
} from "./appwrite.js";
import logger, { handle } from "./logger.js";
import "dotenv/config";

/**
 *
 */
class Server {
  #server;
  #wsServer;
  #logger;
  #admin;
  #event;

  /**
   *
   * @param {import("express").Application} app
   * @param {import("pino").Logger} log
   */
  constructor(app, log) {
    // this.#server = app();
    this.#logger = log;
    this.#admin = createAdminClient();
    this.#event = new EventEmitter();

    this.#event.on("feeds:publish", this.publishFeeds.bind(this));
  }

  createServer() {
    const app = express();
    const PORT = process.env.PORT || 3001;

    // app.use(handle);

    app.get("/", (req, res) => {
      res.send("Hello");
    });

    this.#server = app.listen(PORT);

    this.#server.on("listening", (res) => {
      // this.#logger.info("Server listening on port " + PORT);
      console.log("Server listening on port " + PORT);
    });

    this.#server.on("error", (err) => {
      // this.#logger.error(err, 'An unexpected error occurred while processing the request');
      console.log(
        err,
        "An unexpected error occurred while processing the request"
      );
    });

    this.createSocket();
  }

  getUsers() {
    return this.#admin.users.list();
  }

  getProfiles() {
    let result = this.#admin.database.listDocuments(
      APPWRITE_DATABASE,
      APPWRITE_PROFILE_COLLECTION
    );
    return result;
  }

  async getProfile(userId) {
    let result = await this.#admin.database.listDocuments(
      APPWRITE_DATABASE,
      APPWRITE_PROFILE_COLLECTION,
      [Query.equal("user_id", userId), Query.limit(1)]
    );
    return result.documents[0];
  }

  async getStatuses(profileId) {
    let result = await this.#admin.database.listDocuments(
      APPWRITE_DATABASE,
      APPWRITE_POSTS_COLLECTION,
      [
        // Query.equal('user_id', profileId)
      ]
    );
    return result.documents[0];
  }

  async buildFeeds() {
    // this.#logger("Initializing building feeds");
    let { users } = await this.getUsers();
    let feeds = new Array();

    for (const user of users) {
      let profile = await this.getProfile(user.$id);
      let statuses = await this.getStatuses(user.$id);
      // this.#logger(statuses);
      if (profile) {
        // feeds.push(profile);
        console.log(statuses);
      }
    }

    this.#event.emit("feeds:publish", feeds);
    // this.#logger("Stoping building feeds");
  }

  createSocket() {
    const clients = new Set();
    const connections = new Map();
    // let clients = new List<IWebSocketConnection>();

    // Creates a new WebSocket connection to the specified URL.
    this.#wsServer = new WebSocketServer({
      // path: "/ws/v1",
      server: this.#server,
    });

    // this.#server.on("upgrade", (request, socket, head) => {
    //   // const { pathname } = new URL(request.URL, "wss://base.url");
    //   // if (pathname === "/foo") {
    //   //   ws1.handleUpgrade(request, socket, head, function done(ws) {
    //   //     ws1.emit('connection', ws, request);
    //   //   })
    //   // }
    //   // else {
    //   //   socket.destroy();
    //   // }
    //   // const authed = authenticate(request);

    //   // if (!authed) {
    //   //   // \r\n\r\n: These are control characters used in HTTP to
    //   //   // denote the end of the HTTP headers section.
    //   //   socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    //   //   socket.destroy();
    //   //   return;
    //   // }

    //   socket.on("error", onSocketError);

    //   this.#wsServer.handleUpgrade(request, socket, head, (connection, request) => {
    //     // Manually emit the 'connection' event on a WebSocket
    //     // server (we subscribe to this event below).
    //     this.#wsServer.emit("connection", connection, request, "client");
    //   });
    // });

    this.#wsServer.on(
      "connection",
      (/*socket*/ connection /*stream*/, request, client) => {
        console.log("Client connected");
        const [_path, params] = request?.url?.split("?");
        const connectionParams = queryString.parse(params);
        const ip = request.socket.remoteAddress;
        // const ip = request.headers["X-Forwarded-For"].split(",")[0].trim();

        console.log(ip);
        clients.add(connection);

        const uuid = randomUUID();
        const color = Math.floor(Math.random() * 360);
        const metadata = {
          uuid,
          color,
          date: "2020-04-06",
          symbol: "SST",
          bid: 0,
          offer: 0,
          last: 0,
          close: 35.46,
          high: 0,
          low: 0,
          open: 0,
          change: 0,
          volume: 0,
          num_trades: 0,
        };

        connections.set(connection, metadata);
        connections[uuid] = connection;

        connection.isAlive = true;

        connection.ping("ping", () => {
          console.log("PING");
        });
        connection.on("pong", heartbeat, () => {
          connection.isAlive = true;
          console.log("PONG");
        });

        // Event listener for incoming messages
        // connection.on("message", (bytes) => handleMessage(bytes, uuid));
        connection.on("message", (message) => {
          console.log(`Received: ${message}`);
          connection.send(JSON.stringify(`{Server: ${message}}`));
          clients.forEach((client) => {
            if (client !== connection && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        });

        // Event listener for client disconnection
        connection.on("close", () => {
          console.log("Client disconnected");
          clients.delete(connection);
          // handleClose(uuid);
        });

        connection.on("error", (error) => {
          console.error(`Socket error: ${error.message}`);
        });
      }
    );

    this.#wsServer.on("error", (error) => {
      console.error("Error: " + error.message);
    });

    // const interval = setInterval(function ping() {
    //   this.#wsServer.clients.forEach((client) => {
    //     if (client.isAlive === false) return client.terminate();
    //     client.isAlive = false;
    //     client.ping();
    //   });
    // }, 3000);

    const authenticate = (token /*request*/) => {
      // const origin = request.headers["origin"];
      // const token = request.headers["authorization"].split(" ")[1];
      // const { token } = url.parse(request.url, true).query;
      // TODO: Actually authenticate token
      if (token === "abc") {
        return true;
      }
    };

    const handleMessage = (bytes, uuid) => {
      // Convert the bytes (buffer) into a string using utf-8 encoding.
      const obj = bytes.toString();
      const parsedMessage = JSON.parse(obj);
      const connection = connections[uuid];
      const metadata = connections.get(uuid);
      let data;
      // if (isUint8Array(bytes)) {
      //   data = new ArrayBuffer(bytes)
      // }
      console.log("Received message: %s", parsedMessage);

      if (parsedMessage.type === "authenticate") {
        connection.authenticated = authenticate(parsedMessage.token);
        return;
      }

      if (connection.authenticated) {
        // Broadcast the message to all connected clients
        this.#wsServer.clients.forEach((client) => {
          if (client.isAlive === false) return client.terminate();
          // broadcasting message to all connected clients, excluding itself
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.isAlive = false;
            // client.ping();
            client.send(parsedMessage);
          }
        });

        [...this.#wsServer.clients.keys()].forEach((client) => {
          client.send(outbound);
        });
      } else {
        connection.terminate();
      }
    };

    const handleClose = (uuid) => {
      console.log("A client disconnected. Reconnecting...");
      delete connections[uuid];
      this.#wsServer.clients.delete(uuid);

      // setTimeout(this, 1000);
      clearInterval(interval);
    };

    const onSocketError = (err) => {
      console.error(err);
    };

    const heartbeat = () => {
      this.isAlive = true;
    };

    // return this.#wsServer;
    // return socket;
  }

  publishFeeds(feeds) {
    this.ws = this.createSocket();
    this.ws.send(feeds);
  }
}

new Server(express, logger).createServer();
