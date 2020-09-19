'use strict';

const _ = require('lodash');
const fs = require('fs');
const { parse } = require('fast-csv');
const path = require('path');
const mkdirp = require('mkdirp');
const XLSX = require('xlsx');

class PrebuildTasks {
    constructor(pathObj) {
        console.time('Pre-build tasks')

        let mergedData = [];
        let readingPromises = [];

        // read all xls, transform them to csv, merge all and then transform to json

        mkdirp(pathObj.outputPath, function (err) {
            if (err) {
                console.error(err);
            } else {

                // xls to csv
                if (fs.existsSync(pathObj.xlsPath) && fs.statSync(pathObj.xlsPath).isDirectory()) {
                    const localeFiles = fs.readdirSync(pathObj.xlsPath);
                    for (let i = 0; i < localeFiles.length; i++) {
                        const filePath = `${pathObj.xlsPath}/${localeFiles[i]}`;
                        if (!fs.statSync(filePath).isDirectory()) {
                            const workbook = XLSX.readFile(filePath);
                            const firstSheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[firstSheetName];

                            fs.writeFileSync(`${pathObj.csvPath}/${path.basename(filePath, path.extname(filePath))}.csv`, XLSX.utils.sheet_to_csv(worksheet));
                        }
                    }
                }

                // csv to js
                if (fs.existsSync(pathObj.csvPath) && fs.statSync(pathObj.csvPath).isDirectory()) {
                    const localeFiles = fs.readdirSync(pathObj.csvPath);
                    for (let i = 0; i < localeFiles.length; i++) {
                        const filePath = `${pathObj.csvPath}/${localeFiles[i]}`;

                        if (!fs.statSync(filePath).isDirectory()) {
                            let promise = new Promise((resolve, reject) => {
                                let strData = '';
                                fs.readFile(filePath, "utf8", function (err, data) {
                                    // Remove useless substring
                                    strData = data.slice(data.indexOf('FUND,Date'));
                                    const stream = parse({ headers: true })
                                        .on('error', error => console.error(error))
                                        .on('data', row => {
                                            let isEmpty = true;
                                            for (let prop in row) {
                                                if (Object.prototype.hasOwnProperty.call(row, prop)) {
                                                    if (row[prop] !== '') {
                                                        isEmpty = false;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (!isEmpty) {
                                                mergedData.push(row)
                                            }
                                        })
                                        .on('end', rowCount => {
                                            resolve();
                                        });
                                    stream.write(strData);
                                    stream.end();

                                });
                            });
                            readingPromises.push(promise);
                        }
                    }
                }

                Promise.all(readingPromises).then(() => {
                    console.log(`Parsed ${mergedData.length} transactions`);
                    if (mergedData.length === 0) {
                        return;
                    }
                    mergedData = _.orderBy(mergedData, ['Date', 'FUND'], ['desc', 'asc']);
                    fs.writeFileSync(`${pathObj.dailySummaryDataPath}/lastest.json`, JSON.stringify(mergedData));
                    console.log(`Wrote data to ${pathObj.dailySummaryDataPath}/lastest.json`);

                    fs.writeFileSync(`${pathObj.outputPath}/mergedData.json`, JSON.stringify(mergedData));
                    console.log(`Wrote data to ${pathObj.outputPath}/mergedData.json`);

                    console.timeEnd('Pre-build tasks');
                })
            }
        })
    }

    apply(compiler) {
        compiler.plugin('done', function () { });
    }
}

// helpers
const getDirectories = (srcpath) =>
    fs.readdirSync(srcpath)
        .map(file => path.join(srcpath, file))
        .filter(path => fs.statSync(path).isDirectory());

const getDirectoriesRecursive = (srcpath) => [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];

const flatten = (lists) => lists.reduce((a, b) => a.concat(b), []);

module.exports = PrebuildTasks;
