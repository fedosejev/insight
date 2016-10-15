const fs = require('fs');
const ejs = require('ejs');
const mkdirp = require('mkdirp');
const minify = require('html-minifier').minify;
const showdown = require('showdown');
const fsExtra = require('fs-extra');
const moment = require('moment');
const glob = require('glob');
const _ = require('lodash');
const isThere = require('is-there');

const DATA_DIRECTORY = 'data';
const BUILD_DIRECTORY = 'build';

const getMonthNumber = date => {
  const zeroBasedMonthNumber = moment(date).month();

  return zeroBasedMonthNumber + 1;
}

const getMonthName = date => moment(date).format('MMMM');

const getListOfYearsMonthsDays = () => {
  const configFilePaths = glob.sync(__dirname + '/' + DATA_DIRECTORY + '/*/*/*/config.json');

  const days = configFilePaths.map(configFilePath => {
    const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    const date = moment(config.date);
    const year = date.year();
    const month = getMonthNumber(config.date);
    const day = date.date();
    const dayName = date.format('Do');

    return {
      year,
      month,
      day,
      dayName
    };
  });

  return days;
};

const getYears = data => (
  _.uniq(data.map(date => date.year))
);

const groupYearsMonthsDays = data => {
  const months = [[],[],[],[],[],[],[],[],[],[],[],[]];
  const results = {};

  data.map(date => {
    const {
      year,
      month,
      day,
      dayName
    } = date;

    if (typeof results[year] === 'undefined') {
      results[year] = months;
    }

    results[year][month].push({
      monthName: moment(date).subtract(1, 'months').format('MMMM'),
      day: day,
      dayName: dayName
    });
  });

  return results;
};

const sortDays = days => (
  days.sort((a, b) => {
    if (a.day > b.day) {
      return -1;
    }

    if (a.day < b.day) {
      return 1;
    }

    return 0;
  })
);

const sortYearsMonthsDays = yearsMonthsDays => {
  let sortedYearsMonthsDays = {};

  Object.keys(yearsMonthsDays).map(year => {
    const months = yearsMonthsDays[year];
    const sortedMonths = months.map(days => {
      return sortDays(days);
    });

    sortedYearsMonthsDays[year] = sortedMonths;
  });

  return sortedYearsMonthsDays;
};

const createHomePage = () => {
  const htmlFilePath = __dirname + '/build/index.html';

  // https://github.com/mde/ejs/issues/124
  const templateFilePath = __dirname + '/source/templates/home/index.ejs';

  const compiled = ejs.compile(fs.readFileSync(templateFilePath, 'utf8'), {
    filename: templateFilePath
  });

  const days = getListOfYearsMonthsDays();
  let yearsMonthsDays = groupYearsMonthsDays(days);
  const years = getYears(days);

  const websiteConfig = readWebsiteConfigFromFile();

  yearsMonthsDays = sortYearsMonthsDays(yearsMonthsDays);

  let htmlContent = compiled({
    pageTitle: websiteConfig.name,
    pageDescription: websiteConfig.description,

    websiteName: websiteConfig.name,
    websiteUrl: websiteConfig.url,
    websiteTagline: websiteConfig.tagline,
    websiteAuthorName: websiteConfig.author.name,
    websiteAuthorUrl: websiteConfig.author.url,

    yearsMonthsDays: yearsMonthsDays,
    years: years,

    googleAnalyticsTrackingId: websiteConfig.googleAnalyticsTrackingId
  });

  htmlContent = minify(htmlContent, {
    collapseWhitespace: true
  });

  fs.writeFileSync(htmlFilePath, htmlContent);
};

const getCanonicalDayUrl = (websiteConfig, dayConfig) => {
  const dayDate = moment(dayConfig.date);
  const year = dayDate.year();
  const month = getMonthNumber(dayConfig.date);
  const date = dayDate.date();

  return websiteConfig.url + year + '/' + month + '/' + date + '/';
};

const getCanonicalMonthUrl = (websiteConfig, year, month) => {
  return websiteConfig.url + year + '/' + month + '/';
};

const getCanonicalYearUrl = (websiteConfig, year) => {
  return websiteConfig.url + year + '/';
};

const readWebsiteConfigFromFile = () => {
  const configFilePath = __dirname + '/data/config.json';
  return JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
};

const createDayDirectory = dayConfig => {
  const dayDate = moment(dayConfig.date);
  const year = dayDate.year();
  const month = getMonthNumber(dayConfig.date);
  const date = dayDate.date();
  const directory = __dirname + '/' + BUILD_DIRECTORY + '/' + year + '/' + month + '/' + date;

  fsExtra.emptyDirSync(directory);
};

const getDayIndexFilePath = dayConfig => {
  const dayDate = moment(dayConfig.date);
  const year = dayDate.year();
  const month = getMonthNumber(dayConfig.date);
  const date = dayDate.date();
  const directory = __dirname + '/' + BUILD_DIRECTORY + '/' + year + '/' + month + '/' + date + '/index.html';

  return directory;
};

const getMonthIndexFilePath = (year, month) => {
  const directory = __dirname + '/' + BUILD_DIRECTORY + '/' + year + '/' + month + '/index.html';

  return directory;
};

const getYearIndexFilePath = year => {
  const directory = __dirname + '/' + BUILD_DIRECTORY + '/' + year + '/index.html';

  return directory;
};

const createDayIndexFile = (dayHtmlContent, dayConfig) => {
  createDayDirectory(dayConfig);

  // https://github.com/mde/ejs/issues/124
  const templateFilePath = __dirname + '/source/templates/day/index.ejs';

  const compiled = ejs.compile(fs.readFileSync(templateFilePath, 'utf8'), {
    filename: templateFilePath
  });

  const websiteConfig = readWebsiteConfigFromFile();
  const htmlFilePath = getDayIndexFilePath(dayConfig);

  const date = moment(dayConfig.date);

  let htmlContent = compiled({
    pageTitle: websiteConfig.name,
    pageDescription: websiteConfig.description,

    websiteName: websiteConfig.name,
    websiteUrl: websiteConfig.url,
    websiteTagline: websiteConfig.tagline,
    websiteAuthorName: websiteConfig.author.name,
    websiteAuthorUrl: websiteConfig.author.url,

    html: dayHtmlContent,
    title: dayConfig.title,
    description: dayConfig.description,
    slug: dayConfig.slug,
    date: moment(dayConfig.date).format('Do of MMMM, YYYY'),

    year: date.year(),
    monthNumber: getMonthNumber(date),
    monthName: getMonthName(date),
    day: date.format('Do'),
    weekday: date.format('dddd'),

    googleAnalyticsTrackingId: websiteConfig.googleAnalyticsTrackingId,
    addThisPubId: websiteConfig.addThisPubId,
    canonicalUrl: getCanonicalDayUrl(websiteConfig, dayConfig)
  });

  htmlContent = minify(htmlContent, {
    collapseWhitespace: true
  });

  fs.writeFileSync(htmlFilePath, htmlContent);
};

const createMonthIndexFile = (year, month) => {
  // https://github.com/mde/ejs/issues/124
  const templateFilePath = __dirname + '/source/templates/month/index.ejs';

  const compiled = ejs.compile(fs.readFileSync(templateFilePath, 'utf8'), {
    filename: templateFilePath
  });

  const websiteConfig = readWebsiteConfigFromFile();
  const htmlFilePath = getMonthIndexFilePath(year, month);

  const days = getListOfYearsMonthsDays();
  let yearsMonthsDays = groupYearsMonthsDays(days);

  yearsMonthsDays = sortYearsMonthsDays(yearsMonthsDays);

  let htmlContent = compiled({
    pageTitle: websiteConfig.name,
    pageDescription: websiteConfig.description,

    websiteName: websiteConfig.name,
    websiteUrl: websiteConfig.url,
    websiteTagline: websiteConfig.tagline,
    websiteAuthorName: websiteConfig.author.name,
    websiteAuthorUrl: websiteConfig.author.url,

    year,
    month: {
      number: month,
      name: moment(month, 'MM').format('MMMM')
    },
    yearsMonthsDays,

    googleAnalyticsTrackingId: websiteConfig.googleAnalyticsTrackingId,
    addThisPubId: websiteConfig.addThisPubId,
    canonicalUrl: getCanonicalMonthUrl(websiteConfig, year, month)
  });

  htmlContent = minify(htmlContent, {
    collapseWhitespace: true
  });

  fs.writeFileSync(htmlFilePath, htmlContent);
};

const createYearIndexFile = year => {
  // https://github.com/mde/ejs/issues/124
  const templateFilePath = __dirname + '/source/templates/year/index.ejs';

  const compiled = ejs.compile(fs.readFileSync(templateFilePath, 'utf8'), {
    filename: templateFilePath
  });

  const websiteConfig = readWebsiteConfigFromFile();
  const htmlFilePath = getYearIndexFilePath(year);

  const days = getListOfYearsMonthsDays();
  let yearsMonthsDays = groupYearsMonthsDays(days);

  yearsMonthsDays = sortYearsMonthsDays(yearsMonthsDays);

  let htmlContent = compiled({
    pageTitle: websiteConfig.name,
    pageDescription: websiteConfig.description,
    
    websiteName: websiteConfig.name,
    websiteUrl: websiteConfig.url,
    websiteTagline: websiteConfig.tagline,
    websiteAuthorName: websiteConfig.author.name,
    websiteAuthorUrl: websiteConfig.author.url,
    
    year,
    yearsMonthsDays,
    
    googleAnalyticsTrackingId: websiteConfig.googleAnalyticsTrackingId,
    addThisPubId: websiteConfig.addThisPubId,
    canonicalUrl: getCanonicalYearUrl(websiteConfig, year)
  });

  htmlContent = minify(htmlContent, {
    collapseWhitespace: true
  });

  fs.writeFileSync(htmlFilePath, htmlContent);
};

const copyDayImagesToBuild = dayConfig => {
  const dayDate = moment(dayConfig.date);
  const year = dayDate.year();
  const month = getMonthNumber(dayConfig.date);
  const date = dayDate.date();
  
  const from = __dirname + '/' + DATA_DIRECTORY + '/' + year + '/' + month + '/' + date + '/images';
  const to = __dirname + '/' + BUILD_DIRECTORY + '/' + year + '/' + month + '/' + date + '/images';

  if (isThere(from)) {
    fsExtra.copySync(from, to);
  }
};

const convertMarkdownToHtml = markdown => {
  const converter = new showdown.Converter({
    noHeaderId: true
  });
  
  return converter.makeHtml(markdown);
};

const readMarkdownFromFile = dayDirectoryName => {
  const markdownFilePath = __dirname + '/data' + dayDirectoryName + 'content.md';
  return fs.readFileSync(markdownFilePath, 'utf8');
};

const readDayConfigFromFile = dayDirectoryName => {
  const configFilePath = __dirname + '/data' + dayDirectoryName + 'config.json';
  return JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
};

const getCleanYear = date => (
  date.split('/')[1]
);

const getCleanMonth = date => (
  date.split('/')[2].replace(/\//g, '')
);

const createDay = dayDirectoryName => {
  console.log('💡 Creating day: ' + dayDirectoryName);

  const dayConfig = readDayConfigFromFile(dayDirectoryName);
  const dayMarkdown = readMarkdownFromFile(dayDirectoryName);
  const dayHtml = convertMarkdownToHtml(dayMarkdown);

  createDayIndexFile(dayHtml, dayConfig);
  copyDayImagesToBuild(dayConfig);
};

const createMonth = monthDirectoryName => {
  console.log('💡 Creating month: ' + monthDirectoryName);

  const yearDirectoryName = getCleanYear(monthDirectoryName);
  monthDirectoryName = getCleanMonth(monthDirectoryName);

  createMonthIndexFile(yearDirectoryName, monthDirectoryName);
};

const createYear = yearDirectoryName => {
  console.log('💡 Creating year: ' + yearDirectoryName);

  yearDirectoryName = yearDirectoryName.replace(/\//g, '');

  createYearIndexFile(yearDirectoryName);
};

const getListOfDayDirectoriesInDataDirectory = () => {
  const directoryPaths = glob.sync(__dirname + '/data/*/*/*/');
  const cleanDirectoryPaths = directoryPaths.map(directoryPath => (
    directoryPath.split('/data')[1]
  ));

  return cleanDirectoryPaths;
};

const getListOfMonthDirectoriesInDataDirectory = () => {
  const directoryPaths = glob.sync(__dirname + '/data/*/*/');
  const cleanDirectoryPaths = directoryPaths.map(directoryPath => (
    directoryPath.split('/data')[1]
  ));

  return cleanDirectoryPaths;
};

const getListOfYearDirectoriesInDataDirectory = () => {
  const directoryPaths = glob.sync(__dirname + '/data/*/');
  const cleanDirectoryPaths = directoryPaths.map(directoryPath => (
    directoryPath.split('/data')[1]
  ));

  return cleanDirectoryPaths;
};

const createDays = () => (
  getListOfDayDirectoriesInDataDirectory().forEach(createDay)
);

const createMonths = () => (
  getListOfMonthDirectoriesInDataDirectory().forEach(createMonth)
);

const createYears = () => (
  getListOfYearDirectoriesInDataDirectory().forEach(createYear)
);

const generate = () => {
  createDays();
  createMonths();
  createYears();
  createHomePage();
  console.log('🏁  Finished.');
}

generate();
