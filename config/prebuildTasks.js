'use strict';

const fs = require('fs');
const { parse } = require('fast-csv');
const path = require('path');
const mkdirp = require('mkdirp');
const _ = require('lodash');

class PrebuildTasks {
    constructor(pathObj) {
        console.time('Pre-build tasks')

        let mergedData = [];
        // let rResolve;
        // const dataReadings = new Promise((resolve) => { rResolve = resolve; })
        let readingPromises = [];
        mkdirp(pathObj.outputPath, function (err) {
            if (err) {
                console.error(err);
            } else {
                // read all csvs, merge them all and transform to js
                if (fs.existsSync(pathObj.inputPath) && fs.statSync(pathObj.inputPath).isDirectory()) {
                    const localeFiles = fs.readdirSync(pathObj.inputPath);
                    for (let i = 0; i < localeFiles.length; i++) {
                        const filePath = `${pathObj.inputPath}/${localeFiles[i]}`;
                        if (!fs.statSync(filePath).isDirectory()) {
                            let promise = new Promise((resolve, reject) => {
                                let strData = '';
                                fs.readFile(filePath, "utf8", function (err, data) {
                                    // Remove useless substring
                                    strData = data.slice(data.indexOf('FUND,Date'));
                                    const stream = parse({ headers: true })
                                        .on('error', error => console.error(error))
                                        .on('data', row => mergedData.push(row))
                                        .on('end', rowCount => {
                                            console.log(`Parsed ${rowCount} rows`);
                                            resolve();
                                        });
                                    stream.write(strData);
                                    stream.end();

                                });
                            });
                            readingPromises.push(promise);
                        }
                    }
                    Promise.all(readingPromises).then(() => {
                        fs.writeFileSync(`${pathObj.outputPath}/mergedData.js`, 'var rawData = ' + JSON.stringify(mergedData));
                    })
                }
            }
            console.timeEnd('Pre-build tasks');
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
