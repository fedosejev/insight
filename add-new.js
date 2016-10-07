const moment = require('moment');
const fs = require('fs');
const fsExtra = require('fs-extra');

const DATA_DIRECTORY = 'data';

const createDateDirectory = (now) => {
  const year = now.year();
  const month = now.month() + 1;
  const date = now.date();
  const directory = __dirname + '/' + DATA_DIRECTORY + '/' + year + '/' + month + '/' + date;

  fsExtra.emptyDirSync(directory);
};

const createImagesDirectory = (now) => {
  const year = now.year();
  const month = now.month() + 1;
  const date = now.date();
  const directory = __dirname + '/' + DATA_DIRECTORY + '/' + year + '/' + month + '/' + date + '/images';

  fsExtra.emptyDirSync(directory);
};

const createConfigFile = (now) => {
  const year = now.year();
  const month = now.month() + 1;
  const date = now.date();
  const file = __dirname + '/' + DATA_DIRECTORY + '/' + year + '/' + month + '/' + date + '/config.json';
  const config = {
    date: now
  };

  fs.writeFileSync(file, JSON.stringify(config, null, 4)); 
};

const createContentFile = (now) => {
  const year = now.year();
  const month = now.month() + 1;
  const date = now.date();
  const file = __dirname + '/' + DATA_DIRECTORY + '/' + year + '/' + month + '/' + date + '/content.md';

  fs.writeFileSync(file, ''); 
};


const create = () => {
  const now = moment();

  createDateDirectory(now);
  createImagesDirectory(now);
  createConfigFile(now);
  createContentFile(now);
};

create();