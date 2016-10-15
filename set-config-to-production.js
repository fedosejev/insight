const fs = require('fs');
const CONFIG_FILE_PATH = __dirname + '/data/config.json';
const PRODUCTION_URL = 'https://fedosejev.github.io/insight';

const readWebsiteConfigFromFile = () => (
  JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'))
);

const setConfigToProduction = () => {
  const config = readWebsiteConfigFromFile();
  config.url = PRODUCTION_URL;
  writeConfigToFile(config);
};

const writeConfigToFile = config => (
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 4))
);

setConfigToProduction();