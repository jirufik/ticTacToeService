import config from 'config';
import Graylog from 'jrf-graylog';

const graylogConfig = config.get('graylog');

class Logger {

  constructor({provider = defaultProvider} = {}) {

    this.provider = provider;

  }

  static createLogger() {

    const createDefault = !graylogConfig.address || !graylogConfig.port;
    if (createDefault) {
      return new Logger();
    }

    return new Graylog(graylogConfig);

  }

  setProvider({provider}) {
    this.provider = provider;
  }

  log(log, level) {
    return this.provider.log(log, level);
  }

  emergency(log) {
    return this.provider.emergency(log);
  }

  alert(log) {
    return this.provider.alert(log);
  }

  critical(log) {
    return this.provider.critical(log);
  }

  error(log) {
    return this.provider.error(log);
  }

  warning(log) {
    return this.provider.warning(log);
  }

  notice(log) {
    return this.provider.notice(log);
  }

  info(log) {
    return this.provider.info(log);
  }

  debug(log) {
    return this.provider.debug(log);
  }

}

const defaultProvider = {
  log(log, level) {
    console.log(log);
  },
  emergency(log) {
    console.log(log);
  },
  alert(log) {
    console.log(log);
  },
  critical(log) {
    console.log(log);
  },
  error(log) {
    console.error(log);
  },
  warning(log) {
    console.log(log);
  },
  notice(log) {
    console.log(log);
  },
  info(log) {
    console.log(log);
  },
  debug(log) {
    console.log(log);
  },
};

const logger = Logger.createLogger();

module.exports = logger;



