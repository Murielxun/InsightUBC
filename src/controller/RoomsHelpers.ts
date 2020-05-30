import {Building, Room} from "./AddDatasetHelpers";

export default class RoomsHelpers {
    private static geolocation = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team157/";
    public static getBuildingInfo(tableNode: any): any[] {
        let infoList: any[] = [];
        for (let index in tableNode.childNodes) {
            if (tableNode.childNodes[index].nodeName === "tbody"
                && tableNode.childNodes[index].tagName === "tbody") {
                let tbody = tableNode.childNodes[index];
                for (let tr in tbody.childNodes) {
                    if (tbody.childNodes[tr].nodeName === "tr"
                        && tbody.childNodes[tr].tagName === "tr") {
                        let buildings = tbody.childNodes[tr].childNodes;
                        let newBuilding: Building = {fullname: "", shortname: "", address: "", lat: null, lon: null};
                        let buildingCode = JSON.stringify({
                            name: "class", value: "views-field views-field-field-building-code"});
                        let buildingTitle = JSON.stringify({
                            name: "class", value: "views-field views-field-title"});
                        let buildingAddress = JSON.stringify({
                            name: "class", value: "views-field views-field-field-building-address"});
                        for (let td in buildings) {
                            if (buildings[td].nodeName === "td" && buildings[td].tagName === "td") {
                                switch (JSON.stringify(buildings[td].attrs[0])) {
                                    case buildingCode:
                                        newBuilding.shortname = buildings[td].childNodes[0].value.trim();
                                        break;
                                    case buildingTitle:
                                        for (let a in buildings[td].childNodes) {
                                            if (buildings[td].childNodes[a].nodeName === "a"
                                                && buildings[td].childNodes[a].tagName === "a") {
                                                newBuilding.fullname = buildings[td].childNodes[a].
                                                    childNodes[0].value.trim();
                                            }
                                        }
                                        break;
                                    case buildingAddress:
                                        newBuilding.address = buildings[td].childNodes[0].value.trim();
                                        break;
                                    default:
                                }
                            }
                        }
                        this.getHTTP(newBuilding);
                        infoList.push(newBuilding);
                    }
                }
            }
        }
        return infoList;
    }

    public static addRooms(dataList: any[], tableNode: any, newBuilding: Building) {
        for (let index in tableNode.childNodes) {
            if (tableNode.childNodes[index].nodeName === "tbody"
                && tableNode.childNodes[index].tagName === "tbody") {
                let bodyNode = tableNode.childNodes[index];
                let rooms: any[];
                for (let tr in bodyNode.childNodes) {
                    let newRoom: Room = {
                        fullname: "", shortname: "", number: "", name: "", address: "",
                        lat: 0, lon: 0, seats: 0, type: "", furniture: "", href: "",
                    };
                    if (bodyNode.childNodes[tr].nodeName === "tr"
                        && bodyNode.childNodes[tr].tagName === "tr") {
                        rooms = bodyNode.childNodes[tr].childNodes;
                        this.addRoomHelpers(rooms, newRoom);
                        newRoom.fullname = newBuilding.fullname;
                        newRoom.lat = newBuilding.lat;
                        newRoom.lon = newBuilding.lon;
                        newRoom.shortname = newBuilding.shortname;
                        newRoom.name = newRoom.shortname + "_" + newRoom.number;
                        newRoom.address = newBuilding.address;
                        dataList.push(newRoom);
                    }
                }
            }
        }
    }

    public static addRoomHelpers(rooms: any[], newRoom: Room) {
        let roomNumber = JSON.stringify({
            name: "class", value: "views-field views-field-field-room-number"});
        let roomCapacity = JSON.stringify({
            name: "class", value: "views-field views-field-field-room-capacity"});
        let roomFurniture = JSON.stringify({
            name: "class", value: "views-field views-field-field-room-furniture"});
        let roomType = JSON.stringify({
            name: "class", value: "views-field views-field-field-room-type"});
        let roomHREF = JSON.stringify({
            name: "class", value: "views-field views-field-nothing"});
        for (let td in rooms) {
            if (rooms[td].nodeName === "td" && rooms[td].tagName === "td") {
                switch (JSON.stringify(rooms[td].attrs[0])) {
                    case roomNumber:
                        for (let a in rooms[td].childNodes) {
                            if (rooms[td].childNodes[a].nodeName === "a"
                                && rooms[td].childNodes[a].tagName === "a") {
                                newRoom.number = rooms[td].childNodes[a].childNodes[0].value.trim();
                            }
                        }
                        break;
                    case roomCapacity:
                        newRoom.seats = +rooms[td].childNodes[0].value;
                        break;
                    case roomFurniture:
                        newRoom.furniture = rooms[td].childNodes[0].value.trim();
                        break;
                    case roomType:
                        newRoom.type = rooms[td].childNodes[0].value.trim();
                        break;
                    case roomHREF:
                        for (let a in rooms[td].childNodes) {
                            let moreInfo = rooms[td].childNodes[a];
                            for (let href in moreInfo.attrs) {
                                if (moreInfo.attrs[href].name === "href") {
                                    newRoom.href = moreInfo.attrs[href].value.trim();
                                }
                            }
                        }
                        newRoom.href = rooms[td].childNodes[1].attrs[0].value.trim();
                        break;
                    default:
                }
            }
        }
    }

    public static findNode(childNodes: any[], targetValue: any): any {
        for (let index in childNodes) {
            if (childNodes[index].nodeName === targetValue && childNodes[index].tagName === targetValue) {
                return childNodes[index];
            }
        }
        let nextNodes: any[] = [];
        for (let index in childNodes) {
            if ((childNodes[index].nodeName === "div" && childNodes[index].tagName === "div")
                || (childNodes[index].nodeName === "section" && childNodes[index].tagName === "section")) {
                nextNodes = nextNodes.concat(childNodes[index].childNodes);
            }
        }
        if (nextNodes.length === 0) {
            return null;
        }
        return this.findNode(nextNodes, targetValue);
    }

    public static findBody(newResult: any): any {
        for (let index in newResult.childNodes) {
            if (newResult.childNodes[index].nodeName === "html"
                && newResult.childNodes[index].tagName === "html") {
                let nextNode = newResult.childNodes[index];
                for (let index2 in nextNode.childNodes) {
                    if (nextNode.childNodes[index2].nodeName === "body"
                        && nextNode.childNodes[index2].tagName === "body") {
                        return nextNode.childNodes[index2];
                    }
                }
            }
        }
    }

    public static getHTTP(newBuilding: any) {
        let encode = newBuilding.address;
        while (encode.includes(" ")) {
            encode = encode.replace(" ", "%20");
        }
        let url = this.geolocation + encode;
        let http = require("http");
        http.get(url, {}, (res: any) => {
            res.setEncoding("utf8");
            let rawData = "";
            res.on("data", (chunk: any) => {
                rawData += chunk;
            });
            res.on("end", () => {
                try {
                    let parsedData = JSON.parse(rawData);
                    newBuilding.lat = parsedData.lat;
                    newBuilding.lon = parsedData.lon;
                    if (newBuilding.lat === undefined) {
                        newBuilding.lat = -1000;
                    }
                } catch (e) {
                    newBuilding.lat = -1000;
                }
            });
        });
    }
}
