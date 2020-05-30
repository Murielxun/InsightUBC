import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError, ResultTooLargeError,
} from "./IInsightFacade";
import * as JSZip from "jszip";
import {JSZipLoadOptions} from "jszip";
import ChooseUsefulData from "./ChooseUsefulData";
import QueryValidityCheck from "./QueryValidityCheck";
import * as fs from "fs";
import AddDatasetHelpers from "./AddDatasetHelpers";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export interface Course {
    dept: string;
    id: string;
    avg: number;
    instructor: string;
    title: string;
    pass: number;
    fail: number;
    audit: number;
    uuid: string;
    year: number;
}

export default class InsightFacade implements IInsightFacade {
    public static curData: string;

    constructor() {
        InsightFacade.insightList = {};
        this.readDataset();
        Log.trace("InsightFacadeImpl::init()");
    }

    public static insightList: { [id: string]: InsightDataset } = {};

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let newJSZIP = new JSZip();
        const loadOptions: JSZipLoadOptions = {
            base64: true, checkCRC32: false, createFolders: false, optimizedBinaryString: false
        };
        let valid: boolean = !AddDatasetHelpers.validInput(id, kind, content, InsightFacade.insightList);
        return new Promise<boolean>((resolve) => {
            resolve(valid);
        }).then((res) => {
            if (res) {
                return newJSZIP.loadAsync(content, loadOptions);
            }
            throw new InsightError();
        }).then((result) => {
            let fileList: any[] = [];
            valid = AddDatasetHelpers.getFiles(fileList, result, kind);
            return new Promise((resolve, reject) => {
                if (valid) {
                    resolve(fileList);
                } else {
                    reject (null);
                }
            });
        }).then((result: any) => {
            if (result === null || result.length === 0) {
                return new Promise((resolve, reject) => {
                    reject(null);
                });
            }
            return AddDatasetHelpers.writeData(result, kind, id);
        }).then((result: number) => {
            return new Promise<string[]>((resolve, reject) => {
                if (result !== 0) {
                    InsightFacade.insightList[id] = {id: id, kind: kind, numRows: result};
                    resolve(Object.keys(InsightFacade.insightList));
                } else {
                    reject(new InsightError());
                }
            });
        }).catch((err) => {
            return new Promise((resolve, reject) => {
                reject(new InsightError(err));
            });
        });
    }

    public removeDataset(id: string): Promise<string> {
        let valid: boolean = true;
        let errMessage: string = "";
        try {
            const IDArray = id.split("");
            const IDSet = new Set(IDArray);
            if (id.includes("_")) {
                valid = false;
                errMessage = "ID should not contain underscore.";
            } else if (IDSet.size === 1 && id.includes(" ") || id === "") {
                valid = false;
                errMessage = "ID can not be white space only.";
            } else if (!Object.keys(InsightFacade.insightList).includes(id)) {
                valid = false;
                errMessage = "ID NOT FOUND";
            } else {
                delete InsightFacade.insightList[id];
                try {
                    fs.unlinkSync("data/" + id + ".json");
                } catch (e) {
                    if (!fs.existsSync("./data")) {
                        fs.mkdirSync("./data");
                    }
                }
            }
        } catch (e) {
            valid = false;
        }
        return new Promise<string>((resolve, reject) => {
            if (valid) {
                resolve(id);
            } else if (errMessage === "ID NOT FOUND") {
                reject(new NotFoundError(errMessage));
            } else {
                reject(new InsightError(errMessage));
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        this.readDataset();
        return new Promise<InsightDataset[]>((resolve, reject) => {
            resolve(Object.values(InsightFacade.insightList));
        });
    }

    public performQuery(query: any): Promise<any[]> {
        let sectionList: any[] = [];
        let finalResults: any[] = [];
        let aggregationList: any[] = [];
        return new Promise<any[]>((resolve, reject) => {
            try {
                if (QueryValidityCheck.firstValidityCheck(query) === 0) {
                    return reject(new InsightError("This query didnt pass parsing"));
                }
            } catch (err) {
                return reject(new InsightError("catch err when try to call validity check"));
            }
            // if (TransValidityCheck.secondSemanticCheck(query) === 0) {
            //     return reject(new InsightError("This query didnt pass semantic check "));
            // }
            const fileToRead = "./data/" + InsightFacade.curData + ".json";
            fs.readFile(fileToRead, "utf8", function (err, returndata) {
                if (err) {
                    return reject(new InsightError("Asked dataset hasn't been added"));
                }
                sectionList = JSON.parse(returndata);
                for (let section of sectionList) {
                    if (ChooseUsefulData.neededData(section, InsightFacade.curData, query["WHERE"]) === 1) {
                        if (!query["TRANSFORMATIONS"]) {
                            let usefulData: object
                                = ChooseUsefulData.getColumns(query["OPTIONS"]["COLUMNS"], section);
                            finalResults.push(usefulData);
                        } else if (query["TRANSFORMATIONS"]) {
                            aggregationList.push(section);
                        }
                    }
                }
                try {
                    if (query["TRANSFORMATIONS"]) {
                        finalResults = ChooseUsefulData.aggregation(query["OPTIONS"]["COLUMNS"],
                            query["TRANSFORMATIONS"], aggregationList);
                    }
                } catch (err) {
                    return reject(err);
                }
                if (finalResults.length > 5000) {
                    return reject(new ResultTooLargeError("Reject cuz result > 5000"));
                }
                if (query["OPTIONS"]["ORDER"]) {
                    finalResults = ChooseUsefulData.sortAccordingtoOrder(query["OPTIONS"], finalResults);
                }
                return resolve(finalResults);
            });
        });
    }

    public readDataset() {
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
        } else {
            fs.readdir("./data", ((err, files) => {
                if (!err) {
                    files.forEach((file) => {
                        let dataRead = fs.readFileSync("data/" + file, "utf8");
                        let fileName = file.substring(0, file.lastIndexOf("."));
                        if (!Object.keys(InsightFacade.insightList).includes(fileName)) {
                            let numRows = 0;
                            let dataset = JSON.parse(dataRead);
                            for (let index in dataset) {
                                numRows++;
                            }
                            let kind = InsightDatasetKind.Rooms;
                            if (fileName === "courses") {
                                kind = InsightDatasetKind.Courses;
                            }
                            InsightFacade.insightList[fileName] = {
                                id: fileName,
                                kind: kind,
                                numRows: numRows
                            };
                        }
                    });
                }
            }));
        }
    }
}
