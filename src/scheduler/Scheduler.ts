import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";

export interface Section {
    section_size: number;
    section_detail: SchedSection;
}

export interface Course {
    course_time: TimeSlot;
    course_name: string;
}

export default class Scheduler implements IScheduler {

    public distances: number[][];

    public allTimes: TimeSlot[] = ["MWF 0800-0900", "MWF 0900-1000", "MWF 1000-1100", "MWF 1100-1200",
        "MWF 1200-1300", "MWF 1300-1400", "MWF 1400-1500", "MWF 1500-1600", "MWF 1600-1700", "TR  0800-0930",
        "TR  0930-1100", "TR  1100-1230", "TR  1230-1400", "TR  1400-1530", "TR  1530-1700"];

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        let sortedSections: Section[] = [];
        for (let index in sections) {
            sortedSections.push({
                section_size: sections[index].courses_pass + sections[index].courses_fail +
                    sections[index].courses_audit,
                section_detail: sections[index]
            });
        }
        sortedSections = this.mergeSort(sortedSections, "section");
        rooms = this.mergeSort(rooms, "room");
        this.distances = new Array(rooms.length);
        for (let i = 0; i < rooms.length; i++) {
            this.distances[i] = new Array(rooms.length);
            for (let j = 0; j < rooms.length; j++) {
                this.distances[i][j] = this.getDistance(rooms[i].rooms_lat, rooms[i].rooms_lon,
                    rooms[j].rooms_lat, rooms[j].rooms_lon);
            }
        }
        return this.getTimetable(sortedSections, rooms);
    }

    public getTimetable(sortedSections: Section[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        let time = 0;
        let room = 0;
        let selectedRooms: number[] = [];
        // let courses: Course[] = [];
        // let conflictSections: number[] = [];
        let timeTable: any[] = [];
        for (let section of sortedSections) {
            // if (this.checkSectionTime(courses, this.allTimes[time], section.section_detail)) {
            //     conflictSections.push(sortedSections.indexOf(section));
            // }
            let newSchedule: any[] = [];
            if (time < this.allTimes.length) {
                newSchedule.push(rooms[room]);
                newSchedule.push(section.section_detail);
                newSchedule.push(this.allTimes[time]);
            } else {
                selectedRooms.push(room);
                time = 0;
                room = this.getNextRoom(section, selectedRooms, rooms);
                newSchedule.push(rooms[room]);
                newSchedule.push(section.section_detail);
                newSchedule.push(this.allTimes[time]);
            }
            timeTable.push(newSchedule);
            time++;
        }
        return timeTable;
        // if (conflictSections === []) {
        //     return timeTable;
        // } else {
        //     return this.handleConflict(timeTable, conflictSections);
        // }
    }

    // public handleConflict(timeTable: Array<[SchedRoom, SchedSection, TimeSlot]>, conflicts: number[],
    //                       courses: Course[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
    //     for (let conflict of conflicts) {
    //         let time: TimeSlot = timeTable[conflict][2];
    //         let section: SchedRoom = timeTable[conflict][0];
    //         for (let slot of this.allTimes) {
    //             if (slot !== time && this.checkSectionTime(courses, slot, )) {
    //             }
    //         }
    //     }
    // }

    public getNextRoom(section: Section, selectedRooms: number[], rooms: SchedRoom[]): number {
        if (section === undefined || section === null) {
            return 0;
        }
        let tryRooms: number[] = [];
        for (let room in rooms) {
            if (rooms[room].rooms_seats >= section.section_size && !selectedRooms.includes(+room)) {
                tryRooms.push(+room);
            }
        }
        if (tryRooms.length > 0) {
            return this.getNextRoomHelper(selectedRooms, tryRooms);
        } else {
            for (let room in rooms) {
                if (!selectedRooms.includes(+room)) {
                    return +room;
                }
            }
        }
    }

    public getNextRoomHelper(selectedRooms: number[], tryRooms: number[]): number {
        let min = 6371000;
        let minIndex = 0;
        if (selectedRooms.length === 1) {
            for (let index in tryRooms) {
                if (this.distances[selectedRooms[0]][tryRooms[index]] < min &&
                    this.distances[selectedRooms[0]][tryRooms[index]] !== 0) {
                    min = this.distances[selectedRooms[0]][tryRooms[index]];
                    minIndex = tryRooms[index];
                }
            }
            return minIndex;
        } else {
            for (let i in tryRooms) {
                let maxIndex = 0;
                let max = 0;
                for (let j in selectedRooms) {
                    if (this.distances[selectedRooms[j]][tryRooms[i]] > max) {
                        max = this.distances[selectedRooms[j]][tryRooms[i]];
                        maxIndex = tryRooms[i];
                    }
                }
                if (max < min && !selectedRooms.includes(maxIndex)) {
                    min = max;
                    minIndex = maxIndex;
                }
            }
        }
        return minIndex;
    }

    public getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        let r = 6371000;
        let cal = (Math.PI / 180);
        let a = (lat1 * cal);
        let b = (lat2 * cal);
        let c = ((lat2 - lat1) * cal);
        let d = ((lon2 - lon1) * cal);
        let e = Math.sin(c / 2) * Math.sin(c / 2) + Math.cos(a) * Math.cos(b)
            * Math.sin(d / 2) * Math.sin(d / 2);
        let f = 2 * Math.atan2(Math.sqrt(e), Math.sqrt(1 - e));
        return r * f;
    }

    public checkSectionTime(courses: Course[], time: TimeSlot, section: SchedSection): boolean {
        for (let index in courses) {
            if (section.courses_dept + section.courses_id === courses[index].course_name &&
                courses[index].course_time === time) {
                return true;
            }
        }
        return false;
    }

    public mergeSort(array: any[], type: string): any[] {
        if (array.length <= 1) {
            return array;
        }
        let middle = Math.floor(array.length / 2);
        let leftArray = array.slice(0, middle);
        let rightArray = array.slice(middle);
        return this.merge(this.mergeSort(leftArray, type), this.mergeSort(rightArray, type), type);
    }

    public merge (leftArray: any[], rightArray: any[], type: string): any[] {
        let resultArray: any[] = [];
        let left = 0, right = 0;
        while (leftArray.length > 0 && rightArray.length > 0) {
            if (this.mergeHelper(leftArray[left], rightArray[right], type)) {
                resultArray.push(leftArray[left]);
                leftArray.splice(left, 1);
            } else {
                resultArray.push(rightArray[right]);
                rightArray.splice(right, 1);
            }
        }
        resultArray = resultArray.concat(leftArray);
        resultArray = resultArray.concat(rightArray);
        return resultArray;
    }

    public mergeHelper(leftObj: any, rightObj: any, type: string): boolean {
        if (type === "section") {
            return leftObj.section_size > rightObj.section_size;
        } else if (type === "room") {
            return leftObj.rooms_seats > rightObj.rooms_seats;
        }
    }
}
