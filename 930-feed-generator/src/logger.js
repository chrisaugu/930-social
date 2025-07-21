import { pino } from "pino";
import pinoHTTP from "pino-http";
import pretter from "pino-pretty";
const __dirname = import.meta.dirname;
const fileTransport = pino.transport({
  target: "pino/file",
  options: { destination: `${__dirname}/app.log` },
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || "info",
    customLevels: {
      emerg: 80,
      alert: 70,
      crit: 60,
      error: 50,
      warn: 40,
      notice: 30,
      info: 20,
      debug: 10,
    },
    useOnlyCustomLevels: true,
    formatters: {
      bindings: (bindings) => {
        return {
          pid: bindings.pid,
          host: bindings.hostname,
          node_version: process.version,
        };
      },
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
  fileTransport,
  // pino.destination(`${__dirname}/app.log`),
  pretter({
    colorize: true,
  })
);

function getUser(userID) {
  const childLogger = logger.child({ userID });
  childLogger.trace("getUser called");
  // retrieve user data and return it
  childLogger.trace("getUser completed");
}

// logger.info("Hello");
// getUser("johndoe");
// logger.info("ending the program");

export default logger;

export const pinoConfig = {
  // Reuse an existing logger instance
  logger: pinoHTTP(),

  // Define a custom request id function
  genReqId: function (req) {
    return req.id;
  },

  // Define custom serializers
  serializers: {
    err: pinoHTTP.stdSerializers.err,
    req: pinoHTTP.stdSerializers.req,
    res: pinoHTTP.stdSerializers.res,
  },

  // Logger level is `info` by default
  //   useLevel: "info",

  // Define a custom logger level
  customLogLevel: function (res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    } else if (res.statusCode >= 500 || err) {
      return "error";
    }
    return "info";
  },
};

export var httpLogger = pinoHTTP();

export function handle(req, res, next) {
  httpLogger(req, res);
  req.log.info("something else");
  res.end("hello world");
  // res.end("hello world");
  next();
}
