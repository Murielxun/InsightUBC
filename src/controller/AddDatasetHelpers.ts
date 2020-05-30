import {Course} from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import * as fs from "fs";
import RoomsHelpers from "./RoomsHelpers";

export interface TempCourse {
    Subject: string;
    Course: string;
    Avg: number;
    Professor: string;
    Title: string;
    Pass: number;
    Fail: number;
    Audit: number;
    id: number;
    Year: string;
    Section: string;
}
export interface Building {
    fullname: string;
    shortname: string;
    address: string;
    lat: number;
    lon: number;
}
export interface Room {
    fullname: string;
    shortname: string;
    number: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    seats: number;
    type: string;
    furniture: string;
    href: string;
}
export default class AddDatasetHelpers {
    private static buildingList: any[] = [];
    public static writeData(fileList: any[], kind: InsightDatasetKind, id: string): Promise<number> {
        let dataList: any[] = [];
        return this.getSections(fileList, dataList, kind).then((res: any[]) => {
            if (res === undefined || res === null || res.length === 0) {
                return new Promise((resolve, reject) => {
                    reject("No valid files");
                });
            }
            let numRows: number = this.writeFiles(res, id);
            return new Promise((resolve, reject) => {
                resolve(numRows);
            });
        });
    }

    public static getSections(fileList: any[], dataList: any[], kind: InsightDatasetKind):
        Promise<any[]> {
        if (kind === InsightDatasetKind.Courses) {
            let file = fileList.pop();
            return this.getCourses(fileList, file, dataList);
        } else {
            return this.getIndex(fileList, dataList);
        }
    }

    public static getIndex(fileList: any[], dataList: any[]): Promise<any[]> {
        const parse5 = require("parse5");
        for (let f in fileList) {
            let file = fileList[f];
            if (file.name.substr(file.name.lastIndexOf("/") + 1) === "index.htm") {
                return file.async("text").then((res: any) => {
                    try {
                        let newResult = parse5.parse(res);
                        let bodyNode = RoomsHelpers.findBody(newResult);
                        let tableNode = RoomsHelpers.findNode(bodyNode.childNodes, "table");
                        if (file.name.substr(file.name.lastIndexOf("/") + 1) === "index.htm") {
                            this.buildingList = RoomsHelpers.getBuildingInfo(tableNode);
                            fileList.splice(fileList.indexOf(file), 1);
                            file = fileList.pop();
                            return this.beforeGetRooms(fileList, file, dataList);
                        }
                    } catch (err) {
                        return new Promise<any[]>((resolve) => {
                            resolve(dataList);
                        });
                    }
                });
            }
        }
    }

    public static beforeGetRooms(fileList: any[], file: any, dataList: any[]): Promise<any[]> {
        return file.async("text").then((res: any) => {
            for (let index in this.buildingList) {
                if (this.buildingList[index].lat === null) {
                    return this.beforeGetRooms(fileList, file, dataList);
                }
            }
            return this.getRooms(fileList, file, dataList);
        });
    }

    public static getRooms(fileList: any[], file: any, dataList: any[]): Promise<any[]> {
        const parse5 = require("parse5");
        return file.async("text").then((res: any) => {
            try {
                let newResult = parse5.parse(res);
                let bodyNode = RoomsHelpers.findBody(newResult);
                let tableNode = RoomsHelpers.findNode(bodyNode.childNodes, "table");
                let nextBuildingName = file.name.substring(file.name.lastIndexOf("/") + 1);
                for (let index in this.buildingList) {
                    if (this.buildingList[index].shortname === nextBuildingName) {
                        if (this.buildingList[index].lat !== -1000) {
                            RoomsHelpers.addRooms(dataList, tableNode, this.buildingList[index]);
                        }
                    }
                }
            } catch (err) {
                if (fileList.length === 0) {
                    return new Promise<any[]>((resolve) => {
                        resolve(dataList);
                    });
                }
                let newfile = fileList.pop();
                return this.getRooms(fileList, newfile, dataList);
            }
            if (fileList.length === 0) {
                return new Promise<any[]>((resolve) => {
                    resolve(dataList);
                });
            }
            let newFile = fileList.pop();
            return this.getRooms(fileList, newFile, dataList);
        });
    }

    public static getCourses(fileList: any[], file: any, dataList: any[]): Promise<Course[]> {
        return file.async("text").then((res: any) => {
            let newResult: any;
            try {
                newResult = JSON.parse(res);
                if (newResult !== null) {
                    if (Object.keys(newResult).includes("result")) {
                        for (let index in newResult.result) {
                            try {
                                let tempCourse = newResult.result[index];
                                let newSection: TempCourse = {Subject: tempCourse["Subject"],
                                    Course: tempCourse["Course"], Avg: tempCourse["Avg"],
                                    Professor: tempCourse["Professor"], Title: tempCourse["Title"],
                                    Pass: tempCourse["Pass"], Fail: tempCourse["Fail"], Audit: tempCourse["Audit"],
                                    id: tempCourse["id"], Year: tempCourse["Year"], Section: tempCourse["Section"]
                                };
                                if (AddDatasetHelpers.validSections(newSection)) {
                                    dataList.push({
                                        dept: newSection.Subject, id: newSection.Course,
                                        avg: newSection.Avg, instructor: newSection.Professor,
                                        title: newSection.Title, pass: newSection.Pass, fail: newSection.Fail,
                                        audit: newSection.Audit, uuid: newSection.id.toString(),
                                        year: newSection.Section === "overall" ? 1900 : +newSection.Year
                                    });
                                }
                            } catch (err) {
                                continue;
                            }
                        }
                    }
                }
            } catch (err) {
                if (fileList.length === 0) {
                    return new Promise<Course[]>((resolve) => {
                        resolve(dataList);
                    });
                }
                let newfile = fileList.pop();
                return this.getCourses(fileList, newfile, dataList);
            }
            if (fileList.length === 0) {
                return new Promise<Course[]>((resolve) => {
                    resolve(dataList);
                });
            }
            let newFile = fileList.pop();
            return this.getCourses(fileList, newFile, dataList);
        });
    }

    private static validSections(tempCourse: TempCourse): boolean {
        try {
            return typeof tempCourse["Subject"] === "string" && typeof tempCourse["Course"] === "string" &&
                typeof tempCourse["Avg"] === "number" && typeof tempCourse["Professor"] === "string" &&
                typeof tempCourse["Title"] === "string" && typeof tempCourse["Pass"] === "number" &&
                typeof tempCourse["Fail"] === "number" && typeof tempCourse["Audit"] === "number" &&
                typeof tempCourse["id"] === "number" && typeof tempCourse["Year"] === "string" &&
                typeof tempCourse["Section"] === "string";
        } catch (e) {
            return false;
        }
    }

    public static writeFiles(dataList: Course[], id: string): number {
        let dataToWrite: string = JSON.stringify(dataList);
        let filePath: string = "data/" + id + ".json";
        let rank = 0;
        for (let index in dataList) {
            rank++;
        }
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
        }
        fs.writeFileSync(filePath, dataToWrite);
        return rank;
    }

    public static getFiles(fileList: any[], result: any, kind: InsightDatasetKind): boolean {
        if (kind === InsightDatasetKind.Courses) {
            return this.getFilesCourses(fileList, result);
        } else {
            return this.getFilesRooms(fileList, result);
        }
    }

    public static getFilesRooms(fileList: any[], result: any): boolean {
        let valid = false;
        let haveIndex = false;
        result.forEach((relativePath: any, file: any) => {
            let fileDir = relativePath.substr(0, 6);
            let fileName = relativePath.substr(relativePath.lastIndexOf("/") + 1);
            if (relativePath === "rooms/index.htm") {
                haveIndex = true;
                fileList.push(file);
            } else if (fileDir === "rooms/" && fileName !== "") {
                fileList.push(file);
                valid = true;
            }
        });
        return valid && haveIndex;
    }

    public static getFilesCourses(fileList: any[], result: any): boolean {
        let valid = false;
        result.forEach((relativePath: any, file: any) => {
            let fileDir = relativePath.substr(0, 8);
            let fileName = relativePath.substr(8);
            if (fileDir === "courses/" && fileName !== "") {
                fileList.push(file);
                valid = true;
            }
        });
        return valid;
    }

    public static validInput(id: string, kind: InsightDatasetKind, content: string, insightList: any): boolean {
        try {
            const IDArray = id.split("");
            const IDSet = new Set(IDArray);
            if (content === undefined || content == null || id.trim().length <= 0 || id.length <= 0) {
                return true;
            }
            if (kind !== InsightDatasetKind.Courses && kind !== InsightDatasetKind.Rooms) {
                return true;
            }
            return id.includes("_") || (IDSet.size === 1 && IDSet.has(" "))
                || Object.keys(insightList).includes(id) || typeof content !== "string";
        } catch (e) {
            return true;
        }
    }
}
