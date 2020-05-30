import InsightFacade from "./InsightFacade";
import TransValidityCheck from "./TransValidityCheck";
import {InsightDatasetKind} from "./IInsightFacade";
import QueryCheckHeplers from "./QueryCheckHelpers";

export default class QueryValidityCheck {

    public static firstValidityCheck(query: any): number {
        if ((typeof query !== "object") || !Object.keys(query).includes("WHERE") ||
            !Object.keys(query).includes("OPTIONS") || Object.keys(query).length > 3) {
            return 0;
        } else if (Object.keys(query).length === 3 && !Object.keys(query).includes("TRANSFORMATIONS")) {
            return 0;
        } else {
            const wherepart = query["WHERE"];
            const optionpart = query["OPTIONS"];
            const transpart = query["TRANSFORMATIONS"];
            if (transpart) {
                if (typeof transpart !== "object" || !optionpart) {
                    return 0;
                } else if (TransValidityCheck.transValidity(transpart, optionpart) !== 1) {
                    return 0;
                }
            }
            if ((typeof wherepart !== "object") || (typeof optionpart !== "object")) {
                return 0;
            }
            if (QueryValidityCheck.optionValidity(optionpart, wherepart, transpart) !== 1) {
                return 0;
            }
            if (QueryValidityCheck.whereValidity(wherepart) !== 1) {
                return 0;
            }
            return 1;
        }
    }

    public static optionValidity(optionpart: any, wherepart: any, transpart: any): number {
        switch (Object.keys(optionpart).length) {
            case 1: // just columns
                if (Object.keys(optionpart)[0] !== "COLUMNS") {
                    return 0;
                }
                break;
            case 2: // columns && order
                if (!optionpart["ORDER"]  || !optionpart["COLUMNS"]) {
                    return 0;
                }
                if ((Object.keys(optionpart)[0] !== "COLUMNS") || Object.keys(optionpart)[1] !== "ORDER") {
                    if ((Object.keys(optionpart)[0]) !== "ORDER" || Object.keys(optionpart)[1] !== "COLUMNS") {
                        return 0;
                    }
                }
                break;
            default: return 0;
        }
        const columnpart = optionpart["COLUMNS"];
        if (!Array.isArray(columnpart) || columnpart.length === 0) {
            return 0;
        }
        let getid: string;
        if (!transpart) {
            getid = columnpart[0].substring(0, columnpart[0].indexOf("_"));
            InsightFacade.curData = getid;
        }
        if (Object.keys(optionpart).length === 2) {
            const orderpart = optionpart["ORDER"];
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
            if (QueryValidityCheck.orderValidity(orderpart) === 0) {
                return 0;
            }
        }
        if (QueryValidityCheck.columnValidity(columnpart, transpart) === 0) {
            return 0;
        }
        return 1;
    }

    public static columnValidity(columnpart: any, transpart: any) {
        let getid = InsightFacade.curData;
        let datakind: number = 2;
        if (InsightFacade.insightList[getid].kind === InsightDatasetKind.Courses) {
            datakind = 1;
        }
        if (transpart) {
            if (datakind === 1) {
                for (const eachcolumn of columnpart) {
                    if (QueryCheckHeplers.checkCoursesAnyKey(getid, eachcolumn) === 0) {
                        return 0;
                    }
                }
                return 1;
            } else if (datakind === 2) {
                for (const eachcolumn of columnpart) {
                    if (QueryCheckHeplers.checkRoomsAnyKey(getid, eachcolumn) === 0) {
                        return 0;
                    }
                }
                return 1;
            } else {
                return 0;
            }
        } else if (!transpart) {
            if (datakind === 1) {
                for (const eachcolumn of columnpart) {
                    if (QueryCheckHeplers.checkCoursesKey(getid, eachcolumn) === 0) {
                        return 0;
                    }
                }
                return 1;
            } else if (datakind === 2) {
                for (const eachcolumn of columnpart) {
                    if (QueryCheckHeplers.checkRoomsKey(getid, eachcolumn) === 0) {
                        return 0;
                    }
                }
                return 1;
            } else {
                return 0;
            }
        }
    }

    public static orderValidity (orderpart: any): number {
        let getid = InsightFacade.curData;
        let datakind: number = 2;
        if (InsightFacade.insightList[getid].kind === InsightDatasetKind.Courses) {
            datakind = 1;
        }
        if (typeof orderpart === "object") {
            if (Object.keys(orderpart).length !== 2) {
                return 0;
            }
            let dirpart = orderpart["dir"];
            let keyspart = orderpart["keys"];
            if (!dirpart || !keyspart || typeof dirpart !== "string" || !Array.isArray(keyspart)) {
                return 0;
            } else {
                if (QueryCheckHeplers.checkDirection(dirpart) === 0 || keyspart.length === 0) {
                    return 0;
                }
                if (datakind === 1) {
                    for (const key of keyspart) {
                        if (QueryCheckHeplers.checkCoursesAnyKey(getid, key) === 0) {
                            return 0;
                        }
                    }
                } else if (datakind === 2) {
                    for (const key of keyspart) {
                        if (QueryCheckHeplers.checkRoomsAnyKey(getid, key) === 0) {
                            return 0;
                        }
                    }
                } else {
                    return 0;
                }
                return 1;
            }
        } else if (typeof orderpart === "string") {
            if (datakind === 1) {
                if (QueryCheckHeplers.checkCoursesAnyKey(getid, orderpart) === 1) {
                    return 1;
                }
            } else if (datakind === 2) {
                if (QueryCheckHeplers.checkRoomsAnyKey(getid, orderpart) === 1) {
                    return 1;
                }
            }
            return 0;
        }
    }

    // return 0 if the wherepart passed in is invalid somehow
    public static whereValidity(wherepart: any): number {
        switch (Object.keys(wherepart).length) { // number of elements in where
            case 0:
                return 1;
            case 1:
                switch (Object.keys(wherepart)[0]) {
                    case "AND":
                        return QueryValidityCheck.firstValidityLogicHelper("AND", wherepart);
                    case "OR":
                        return QueryValidityCheck.firstValidityLogicHelper("OR", wherepart);
                    case "LT":
                        return QueryValidityCheck.firstValidityMcomHelper("LT", wherepart);
                    case "GT":
                        return QueryValidityCheck.firstValidityMcomHelper("GT", wherepart);
                    case "EQ":
                        return QueryValidityCheck.firstValidityMcomHelper("EQ", wherepart);
                    case "IS":
                        return QueryValidityCheck.firstValidityIsHelper("IS", wherepart);
                    case "NOT":
                        return QueryValidityCheck.whereValidity(wherepart["NOT"]);
                    default: return 0;
                }
            default: return 0;
        }
    }

    public static firstValidityLogicHelper(logiccase: string, wherepart: any): number {
        let logicpart = wherepart[logiccase];
        if (!Array.isArray(logicpart) || logicpart.length === 0) {
            return 0;
        } else {
            for (const element of logicpart) {
                if (QueryValidityCheck.whereValidity(element) === 0) {
                    return 0;
                }
            }
            return 1;
        }
    }

    public static firstValidityMcomHelper(mcomcase: string, wherepart: any): number {
        let mcompart = wherepart[mcomcase];
        if (typeof mcompart !== "object" || typeof Object.values(mcompart)[0] !== "number"
            || Object.keys(mcompart).length !== 1
            || (!Object.keys(mcompart)[0].includes("_"))) {
            return 0;
        }
        let indexofdash: number = Object.keys(mcompart)[0].indexOf("_");
        let getid: string = Object.keys(mcompart)[0].substring(0, indexofdash);
        if (getid !== InsightFacade.curData) {
            return 0;
        }
        let datakind: number = 2;
        if (InsightFacade.insightList[getid].kind === InsightDatasetKind.Courses) {
            datakind = 1;
        }
        if (datakind === 1) {
            return QueryCheckHeplers.checkCoursesNumberKey(getid, Object.keys(mcompart)[0]);
        } else if (datakind === 2) {
            return QueryCheckHeplers.checkRoomsNumberKey(getid, Object.keys(mcompart)[0]);
        } else {
            return 0;
        }
    }

    private static firstValidityIsHelper(iscase: string, wherepart: any): number {
        let ispart = wherepart[iscase];
        if ((typeof ispart !== "object") || typeof Object.values(ispart)[0] !== "string"
            || Object.keys(ispart).length !== 1
            || (!Object.keys(ispart)[0].includes("_"))) {
            return 0;
        }
        let indexofdash: number = Object.keys(ispart)[0].indexOf("_");
        let getid: string = Object.keys(ispart)[0].substring(0, indexofdash);
        if (getid !== InsightFacade.curData) {
            return 0;
        }
        let datakind: number = 2;
        if (InsightFacade.insightList[getid].kind === InsightDatasetKind.Courses) {
            datakind = 1;
        }
        if (datakind === 1) {
            if (QueryCheckHeplers.checkCoursesStringKey(getid, Object.keys(ispart)[0]) !== 1) {
                return 0;
            }
        } else if (datakind === 2) {
            if (QueryCheckHeplers.checkRoomsStringKey(getid, Object.keys(ispart)[0]) !== 1) {
                return 0;
            }
        } else {
            return 0;
        }
        let isvalue: string = Object.values(ispart)[0] as string;
        switch (isvalue.split("*").length - 1) {
            case 0: // no *
                return 1;
            case 1: // one wildcard
                if (isvalue.length === 1) {
                    return 1;
                } else if (!(isvalue.charAt(0) === "*" && isvalue.charAt(isvalue.length - 1) !== "*")
                    && !(isvalue.charAt(0) !== "*" && isvalue.charAt(isvalue.length - 1) === "*")) {
                    return 0; // *d / d* / ddddd*ddddd
                }
                return 1;
            case 2: // 2 wildcard
                if (isvalue.length === 2) {
                    return 1;
                } else if (isvalue.charAt(0) !== "*" || isvalue.charAt(isvalue.length - 1) !== "*") {
                    return 0; // ddd*ddd*
                }
                return 1;
            default:
                return 0;
        }
    }
}
