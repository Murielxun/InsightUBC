export default class QueryCheckHeplers {
    public static checkCoursesStringKey(id: string, key: string): number {
        switch (key) {
            case (id + "_dept"): return 1;
            case (id + "_id"): return 1;
            case (id + "_instructor"): return 1;
            case (id + "_title"): return 1;
            case (id + "_uuid"): return 1;
            default: return 0;
        }
    }

    public static checkRoomsStringKey(id: string, key: string): number {
        switch (key) {
            case (id + "_fullname"): return 1;
            case (id + "_shortname"): return 1;
            case (id + "_number"): return 1;
            case (id + "_name"): return 1;
            case (id + "_address"): return 1;
            case (id + "_type"): return 1;
            case (id + "_furniture"): return 1;
            case (id + "_href"): return 1;
            default: return 0;
        }
    }

    public static checkCoursesNumberKey(id: string, key: string): number {
        switch (key) {
            case (id + "_fail"): return 1;
            case (id + "_pass"): return 1;
            case (id + "_avg"): return 1;
            case (id + "_audit"): return 1;
            case (id + "_year"): return 1;
            default: return 0;
        }
    }

    public static checkRoomsNumberKey(id: string, key: string): number {
        switch (key) {
            case (id + "_lat"): return 1;
            case (id + "_lon"): return 1;
            case (id + "_seats"): return 1;
            default: return 0;
        }
    }

    public static checkDirection (direction: string): number {
        switch (direction) {
            case "UP": return 1;
            case "DOWN": return 1;
            default: return 0;
        }
    }

    public static checkCoursesKey (id: string, key: string): number {
        switch (key) {
            case (id + "_dept"): return 1;
            case (id + "_id"): return 1;
            case (id + "_instructor"): return 1;
            case (id + "_title"): return 1;
            case (id + "_uuid"): return 1;
            case (id + "_fail"): return 1;
            case (id + "_pass"): return 1;
            case (id + "_avg"): return 1;
            case (id + "_audit"): return 1;
            case (id + "_year"): return 1;
            default: return 0;
        }
    }

    public static checkRoomsKey(id: string, key: string): number {
        switch (key) {
            case (id + "_fullname"): return 1;
            case (id + "_shortname"): return 1;
            case (id + "_number"): return 1;
            case (id + "_name"): return 1;
            case (id + "_address"): return 1;
            case (id + "_type"): return 1;
            case (id + "_furniture"): return 1;
            case (id + "_href"): return 1;
            case (id + "_lat"): return 1;
            case (id + "_lon"): return 1;
            case (id + "_seats"): return 1;
            default: return 0;
        }
    }


    public static checkCoursesAnyKey (id: string, key: string): number {
        if (QueryCheckHeplers.checkCoursesKey(id, key) === 1) {
            return 1;
        } else if (!key.includes("_") && key.split("_").join("").length !== 0 && key.length > 0) {
            return 1;
        }
        return 0;
    }

    public static checkRoomsAnyKey (id: string, key: string): number {
        if (QueryCheckHeplers.checkRoomsKey(id, key) === 1) {
            return 1;
        } else if (!key.includes("_") && key.split("_").join("").length !== 0 && key.length > 0) {
            return 1;
        }
        return 0;
    }
}
