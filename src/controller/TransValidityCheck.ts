import InsightFacade from "./InsightFacade";
import {InsightDatasetKind} from "./IInsightFacade";
import QueryCheckHeplers from "./QueryCheckHelpers";
import {Decimal} from "decimal.js";

export default class TransValidityCheck {

    // return 0 if the transpart passed in is invalid somehow, return 1 if its valid.
    public static transValidity(transpart: any, optionpart: any): number {
        if (Object.keys(transpart).length !== 2) {
            return 0;
        } else {
            let grouppart = transpart["GROUP"];
            let applypart = transpart["APPLY"];
            let columnpart = optionpart["COLUMNS"];
            let orderpart = optionpart["ORDER"];
            if (!grouppart || !applypart || !Array.isArray(grouppart) || !Array.isArray(applypart)) {
                return 0;
            }
            if (TransValidityCheck.groupValidity(grouppart) === 0
                || TransValidityCheck.applyValidity(applypart, columnpart, grouppart, orderpart) === 0) {
                return 0;
            }
            return 1;
        }
    }

    public static groupValidity(grouppart: any): number {
        if (grouppart.length === 0) {
            return 0;
        }
        let getid = grouppart[0].substring(0, grouppart[0].indexOf("_"));
        InsightFacade.curData = getid;
        if (InsightFacade.insightList[InsightFacade.curData].kind === InsightDatasetKind.Courses) {
            for (const key of grouppart) {
                if (QueryCheckHeplers.checkCoursesStringKey(InsightFacade.curData, key) === 0
                    && QueryCheckHeplers.checkCoursesNumberKey(InsightFacade.curData, key) === 0) {
                    return 0;
                }
            }
            return 1;
        } else if (InsightFacade.insightList[InsightFacade.curData].kind === InsightDatasetKind.Rooms) {
            for (const key of grouppart) {
                if (QueryCheckHeplers.checkRoomsStringKey(InsightFacade.curData, key) === 0
                    && QueryCheckHeplers.checkRoomsNumberKey(InsightFacade.curData, key) === 0) {
                    return 0;
                }
            }
            return 1;
        } else {
            return 0;
        }
    }

    public static applyValidity(applypart: any, columnpart: any, grouppart: any, orderpart: any): number {
        if (applypart.length === 0) {
            return 1;
        } else {
            let applyList: any[] = [];
            for (const applyrule of applypart) {
                let applykey = Object.keys(applyrule)[0];
                if (typeof applyrule !== "object") {
                    return 0;
                } else if (TransValidityCheck.applyruleValidity(applyrule) === 0) {
                    return 0;
                } else {
                    if (applyList.includes(applykey)) {
                        return 0;
                    } else {
                        applyList.push(applykey);
                    }
                }
            }
            for (const column of columnpart) {
                if (!grouppart.includes(column) && !applyList.includes(column)) {
                    return 0;
                }
            }
            return 1;
        }
    }

    public static applyruleValidity(applyrule: any): number {
        if (Object.keys(applyrule).length !== 1) {
            return 0;
        }
        let applykey = Object.keys(applyrule)[0];
        if (applykey.includes("_") || applykey.length === 0
            || applykey.split("_").join("").length === 0) {
            return 0;
        }
        let applyobject = Object.values(applyrule)[0];
        if (typeof applyobject !== "object") {
            return 0;
        }
        if (Object.keys(applyobject).length !== 1) {
            return 0;
        }
        let applytoken = Object.keys(applyobject)[0];
        let applytokenkey = Object.values(applyobject)[0];
        if (TransValidityCheck.checkApplyToken(applytoken, applytokenkey) === 0) {
            return 0;
        }
        return 1;
    }

    public static checkApplyToken(applytoken: string, applytokenkey: string): number {
        let getid = InsightFacade.curData;
        let datakind: number = 2;
        if (InsightFacade.insightList[getid].kind === InsightDatasetKind.Courses) {
            datakind = 1;
        }
        if (applytoken === "MAX" || applytoken === "MIN" || applytoken === "AVG" || applytoken === "SUM") {
            if (datakind === 1) {
                if (QueryCheckHeplers.checkCoursesNumberKey(getid, applytokenkey) === 1) {
                    return 1;
                }
                return 0;
            } else if (datakind === 2) {
                if (QueryCheckHeplers.checkRoomsNumberKey(getid, applytokenkey) === 1) {
                    return 1;
                }
                return 0;
            } else {
                return 0;
            }
        } else if (applytoken === "COUNT") {
            if (datakind === 1) {
                if (QueryCheckHeplers.checkCoursesKey(getid, applytokenkey) === 1) {
                    return 1;
                }
                return 0;
            } else if (datakind === 2) {
                if (QueryCheckHeplers.checkRoomsKey(getid, applytokenkey) === 1) {
                    return 1;
                }
                return 0;
            } else {
                return 0;
            }
        }
        return 0;
    }

    public static applyAggregation(columnpart: any, applypart: any, aggregationList: any[]) {
        let finalList: any[] = [];
        if (applypart.length === 0) {
            for (const eachgroup of aggregationList) {
                let object: object = {};
                for (const eachcolumn of columnpart) {
                    let actualkey = eachcolumn.substring(eachcolumn.indexOf("_") + 1, eachcolumn.length);
                    Object.assign(object, {[eachcolumn]: eachgroup[0][actualkey]});
                }
                finalList.push(object);
            }
            return finalList;
        }
        for (const eachgroup of aggregationList) {
            let object: object = {};
            for (const applyrule of applypart) {
                let applykey = Object.keys(applyrule)[0] as string;
                let applyobject = Object.values(applyrule)[0];
                let applytoken = Object.keys(applyobject)[0];
                let applytokenkey = Object.values(applyobject)[0];
                switch (applytoken) {
                    case "MAX":
                        Object.assign(object, {[applykey]: this.maxHelper(applytokenkey, eachgroup)});
                        break;
                    case "MIN":
                        Object.assign(object, {[applykey]: this.minHelper(applytokenkey, eachgroup)});
                        break;
                    case "AVG":
                        Object.assign(object, {[applykey]: this.avgHelper(applytokenkey, eachgroup)});
                        break;
                    case "SUM":
                        Object.assign(object, {[applykey]: this.sumHelper(applytokenkey, eachgroup)});
                        break;
                    case "COUNT":
                        Object.assign(object, {[applykey]: this.countHelper(applytokenkey, eachgroup)});
                        break;
                    default:
                        break;
                }
            }
            for (const eachcolumn of columnpart) {
                if (eachcolumn.includes("_")) {
                    let actualkey = eachcolumn.substring(eachcolumn.indexOf("_") + 1, eachcolumn.length);
                    Object.assign(object, {[eachcolumn]: eachgroup[0][actualkey]});
                }
            }
            finalList.push(object);
        }
        return finalList;
    }

    private static maxHelper(applytokenkey: string, eachgroup: any): number {
        let key = applytokenkey.substring(applytokenkey.indexOf("_") + 1, applytokenkey.length);
        let max: number = Number.MIN_SAFE_INTEGER;
        for (const element of eachgroup) {
            if (element[key] > max) {
                max = element[key];
            }
        }
        return max;
    }

    private static minHelper(applytokenkey: string, eachgroup: any): number {
        let key = applytokenkey.substring(applytokenkey.indexOf("_") + 1, applytokenkey.length);
        let min: number = Number.MAX_SAFE_INTEGER;
        for (const element of eachgroup) {
            if (element[key] < min) {
                min = element[key];
            }
        }
        return min;
    }

    private static avgHelper(applytokenkey: string, eachgroup: any): number {
        let key = applytokenkey.substring(applytokenkey.indexOf("_") + 1, applytokenkey.length);
        let sum = new Decimal(0);
        for (const element of eachgroup) {
            sum = Decimal.add(sum, new Decimal(element[key]));
        }
        let avg = sum.toNumber() / eachgroup.length;
        return Number(avg.toFixed(2));

    }

    private static sumHelper(applytokenkey: string, eachgroup: any): number {
        let key = applytokenkey.substring(applytokenkey.indexOf("_") + 1, applytokenkey.length);
        let sum = 0;
        for (const element of eachgroup) {
            sum += element[key];
        }
        return Number(sum.toFixed(2));
    }

    private static countHelper(applytokenkey: string, eachgroup: any): number {
        let key = applytokenkey.substring(applytokenkey.indexOf("_") + 1, applytokenkey.length);
        let count = 0;
        let checked: any = [];
        for (const element of eachgroup) {
            if (!checked.includes(element[key])) {
                count++;
                checked.push(element[key]);
            }
        }
        return count;
    }

    public static secondSemanticCheck(query: any): number {
        let optionpart = query["OPTIONS"];
        let columnpart = optionpart["COLUMNS"];
        let orderpart = optionpart["ORDER"];
        let transpart = query["TRANSFORMATIONS"];
        if (transpart) {
            let applypart = transpart["APPLY"];
            let groupart = transpart["GROUP"];
            let applykeyList: string[] = [];
            for (const applyrule of applypart) { // check unique applykey
                let applykey = Object.keys(applyrule)[0];
                if (applykeyList.includes(applykey)) {
                    return 0;
                } else {
                    applykeyList.push(applykey);
                }
            }
            for (const column of columnpart) { // check all column terms are in group/applykey
                if (!groupart.includes(column) && !applykeyList.includes(column)) {
                    return 0;
                }
            }
        }
        if (orderpart && typeof orderpart === "string") {
            if (columnpart.indexOf(orderpart) === -1) {
                return 0;
            }
        } else if (orderpart && typeof orderpart === "object") {
            for (const key of orderpart["keys"]) {
                if (!columnpart.includes(key)) {
                    return 0;
                }
            }
        }
        return 1;
    }
}
