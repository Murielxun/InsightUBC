import TransValidityCheck from "./TransValidityCheck";
import {ResultTooLargeError} from "./IInsightFacade";

export default class ChooseUsefulData {

    // return 1 if the data match the wherepart critera, return 1 if it doesnt
    public static neededData(section: any, datasetid: string, wherepart: any): number {
        if (Object.keys(wherepart).length === 0) {
            return 1;
        } else {
            switch (Object.keys(wherepart)[0]) {
                case "AND":
                    if (wherepart["AND"].length === 0) {
                        return 0;
                    }
                    for (const eachandelement of wherepart["AND"]) {
                        if (ChooseUsefulData.neededData(section, datasetid, eachandelement) === 0) {
                            return 0;
                        }
                    }
                    return 1;
                case "OR":
                    if (wherepart["OR"].length === 0) {
                        return 0;
                    }
                    for (const eachorelement of wherepart["OR"]) {
                        if (ChooseUsefulData.neededData(section, datasetid, eachorelement) === 1) {
                            return 1;
                        }
                    }
                    return 0;
                case "LT":
                    return ChooseUsefulData.chooseDataMcomHelper("LT", wherepart, section, datasetid);
                case "GT":
                    return ChooseUsefulData.chooseDataMcomHelper("GT", wherepart, section, datasetid);
                case "EQ":
                    return ChooseUsefulData.chooseDataMcomHelper("EQ", wherepart, section, datasetid);
                case "IS":
                    let ispart = wherepart["IS"]; // object
                    return ChooseUsefulData.neededDataIsHelper(ispart, section, datasetid);
                case "NOT":
                    if (ChooseUsefulData.neededData(section, datasetid, wherepart["NOT"]) === 0) {
                        return 1;
                    }
                    return 0;
                default: return 0;
            }
        }
    }

    private static neededDataIsHelper(ispart: any, section: any, datasetid: string) {
        let inputstring = Object.values(ispart)[0] as string; // actual string
        switch (inputstring.split("*").length - 1) {
            case 0:
                return ChooseUsefulData.noWildcard(section, datasetid, inputstring, Object.keys(ispart)[0]);
            case 1:
                return ChooseUsefulData.oneWildcard(section, datasetid, ispart);
            case 2:
                return ChooseUsefulData.twoWildcard(section, datasetid, ispart);
            default: return 0;
        }
    }

    private static twoWildcard(section: any, datasetid: string, ispart: any) {
        let returnval: number;
        let inputstr = Object.values(ispart)[0] as string; // actual string
        if (inputstr.length === 2) {
            return 1; // only two **
        } else {
            let str = inputstr.split("*")[1]; // string in middle
            let key = Object.keys(ispart)[0] as string;
            // if (QueryCheckHeplers.checkCoursesStringKey(datasetid, key) === 1) {
            let chosensection = key.substring (key.indexOf("_") + 1, key.length);
            returnval = (section[chosensection].includes(str)) ? 1 : 0;
            // } else {
            //     returnval = 0;
            // }
        }
        return returnval;
    }

    private static oneWildcard(section: any, datasetid: string, ispart: any) {
        let returnval: number;
        let inputstr = Object.values(ispart)[0] as string; // actual string
        if (inputstr.length === 1) { // only one *
            return 1;
        } // only one wildcard
        if (inputstr.charAt(0) === "*")  { // at front
            let str = inputstr.split("*")[1]; // string at end
            returnval = ChooseUsefulData.frontWildCard(str, datasetid, section, Object.keys(ispart)[0]);
        } else if (inputstr.charAt(inputstr.length - 1) === "*") { // at end
            let str = inputstr.split("*")[0]; // string at front
            returnval = ChooseUsefulData.endWildCard(str, datasetid, section, Object.keys(ispart)[0]);
        }
        return returnval;
    }

    public static frontWildCard (str: string, datasetid: string, section: any, key: string) {
        let returnval: number;
        let chosensection = key.substring (key.indexOf("_") + 1, key.length); //
        returnval = (section[chosensection].endsWith(str)) ? 1 : 0; //
        return returnval;
    }

    public static endWildCard (str: string, datasetid: string, section: any, key: string) {
        let returnval: number;
        let chosensection = key.substring(key.indexOf("_") + 1, key.length); //
        returnval = (section[chosensection].startsWith(str)) ? 1 : 0; //
        return returnval;
    }

    // return 1 if found match under no wildcard circumstances, return 0 if x
    private static noWildcard(section: any, datasetid: string, inputstring: string, iskey: string) {
        let returnvalue: number;
        let chosensection = iskey.substring(iskey.indexOf("_") + 1, iskey.length); //
        returnvalue = (section[chosensection] === inputstring) ? 1 : 0; //
        return returnvalue;
    }

    // get columns asked
    public static getColumns(columnpart: any, section: any): object {
        let columnarray: string[] = [];
        let returnvalue: any = {};
        for (const eachcolumn of columnpart ) {
            columnarray.push(eachcolumn as string);
        }
        for (const col of columnarray) {
            returnvalue[col] = section[col.split("_")[1]];
        }
        return returnvalue;
    }

    // sort data according to "order"
    public static sortAccordingtoOrder(optionpart: any, finalResults: any[]) {
        if (typeof optionpart["ORDER"] === "string") {
            let key: string = optionpart["ORDER"];
            finalResults.sort(function (a, b) {
                switch (typeof a[key]) {
                    case "string":
                        if (typeof b[key] === "string") {
                            return (a[key] < b[key] ? -1 : (b[key] < a[key] ? 1 : 0));
                        }
                        break;
                    case "number":
                        if (typeof b[key] === "number") {
                            return a[key] - b[key];
                        }
                        break;
                    default: return 0;
                }
            });
            return finalResults;
        } else if (typeof optionpart["ORDER"] === "object") {
            let dirkey = optionpart["ORDER"]["dir"];
            let keys = optionpart["ORDER"]["keys"];
            finalResults.sort(function (a, b) {
                let result = 0;
                for (const key of keys) {
                    if (result === 0) {
                        if (typeof a[key] === "number" && typeof b[key] === "number") {
                            if (dirkey === "UP") {
                                result = a[key] - b[key];
                            } else if (dirkey === "DOWN") {
                                result = b[key] - a[key];
                            }
                        } else if (typeof a[key] === "string" && typeof b[key] === "string") {
                            if (dirkey === "UP") {
                                result = (a[key] < b[key] ? -1 : (b[key] < a[key] ? 1 : 0));
                            } else if (dirkey === "DOWN") {
                                result = (b[key] < a[key] ? -1 : (a[key] < b[key] ? 1 : 0));
                            }
                        }
                    }
                }
                return result;
            });
            // finalResults = ChooseUsefulData.orderObjectSort(optionpart, finalResults);
        }
        return finalResults;
    }

    // private static orderObjectSort(optionpart: any, finalResults: any[]) {
    //     let dirkey = optionpart["ORDER"]["dir"];
    //     let keys = optionpart["ORDER"]["keys"];
    //     finalResults.sort(function (a, b) {
    //         if (dirkey === "UP") {
    //             let result = 0;
    //             for (const key of keys) {
    //                 if (result === 0) {
    //                     if (typeof a[key] === "number" && typeof b[key] === "number") {
    //                         result = a[key] - b[key];
    //                     } else if (typeof a[key] === "string" && typeof b[key] === "string") {
    //                         result = (a[key] < b[key] ? -1 : (b[key] < a[key] ? 1 : 0));
    //                     }
    //                 }
    //             }
    //             return result;
    //         } else if (dirkey === "DOWN") {
    //             let result = 0;
    //             for (const key of keys) {
    //                 if (result === 0) {
    //                     if (typeof a[key] === "number" && typeof b[key] === "number") {
    //                         result = b[key] - a[key];
    //                     } else if (typeof a[key] === "string" && typeof b[key] === "string") {
    //                         result = (b[key] < a[key] ? -1 : (a[key] < b[key] ? 1 : 0));
    //                     }
    //                 }
    //             }
    //             return result;
    //         }
    //     });
    //     return finalResults;
    // }

    private static chooseDataMcomHelper(mcom: string, wherepart: any, section: any, datasetid: string) {
        let mcompart = wherepart[mcom];
        let key = Object.keys(mcompart)[0]; //
        let chosenpart = key.substring(key.indexOf("_") + 1, key.length);
        let returnvalue: number;
        switch (mcom) {
            case "LT":
                returnvalue = (section[chosenpart] < Object.values(mcompart)[0]) ? 1 : 0;
                break;
            case "GT":
                returnvalue = (section[chosenpart] > Object.values(mcompart)[0]) ? 1 : 0;
                break;
            case "EQ":
                returnvalue = (section[chosenpart] === Object.values(mcompart)[0]) ? 1 : 0;
                break;
            default:
                returnvalue = 0;
                break;

        }
        return returnvalue; //
    }


    public static aggregation(columnpart: any, transpart: any, aggregationList: any[]) {
        if (aggregationList.length === 0) {
            return aggregationList;
        }
        aggregationList = ChooseUsefulData.getGroups(transpart["GROUP"], aggregationList);
        aggregationList = TransValidityCheck.applyAggregation(columnpart, transpart["APPLY"], aggregationList);
        return aggregationList;
    }

    private static getGroups(grouppart: any, aggregationList: any[]) {
        let groupList: any[] = [];
        for (const eachsection of aggregationList) {
            let statenum: number = 1;
            for (const eachgroup of groupList) {
                let matched = true;
                for (const key of grouppart) {
                    let selectedkey = key.substring(key.indexOf("_") + 1, key.length);
                    if (eachgroup[0][selectedkey] !== eachsection[selectedkey]) {
                        matched = false;
                        break;
                    }
                }
                if (matched) {
                    eachgroup.push(eachsection);
                    statenum = 2;
                    break;
                }
            }
            if (statenum === 1) {
                let newgrouparray: any[] = [];
                newgrouparray.push(eachsection);
                groupList.push(newgrouparray);
            }
        }
        return groupList;
    }
}
