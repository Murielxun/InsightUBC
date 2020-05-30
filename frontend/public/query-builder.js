/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = function () {
    let query = {};
    // TODO: implement!

    // where part
    let dataset = document.getElementsByClassName("nav-item tab active")[0].text.toLowerCase();
    let panel = document.getElementsByClassName("tab-panel active")[0];
    let and = document.getElementById(dataset + "-conditiontype-all").checked;
    let or = document.getElementById(dataset + "-conditiontype-any").checked;
    let none = document.getElementById(dataset + "-conditiontype-none").checked;

    let criterion = panel.getElementsByClassName("control-group condition");
    let allCondition = [];
    let numbers = ["lon", "lat", "seats", "audit", "avg", "pass", "fail", "year"]
    if (criterion.length !== 0) {
        for (const condition of criterion) {
            let condObject = {};
            let notSelect = condition.getElementsByClassName("control not")[0].children[0].checked;
            let key = condition.getElementsByClassName("control fields")[0]
                .getElementsByTagName("select")[0].value;
            let comparsion = condition.getElementsByClassName("control operators")[0]
                .getElementsByTagName("select")[0].value;
            let string = condition.getElementsByClassName("control term")[0]
                .getElementsByTagName("input")[0].value;

            if (!numbers.includes(key)) {
                condObject[dataset + "_" + key] = string;
            } else {
                condObject[dataset + "_" + key] = Number(string);
            }
            if (notSelect) {
                allCondition.push({NOT: {[comparsion]: condObject}});
            } else {
                allCondition.push({[comparsion]: condObject});
            }
        }
    }
    if (allCondition.length === 0) {
        query["WHERE"] = {};
    } else if (allCondition.length === 1) {
        if (none) {
            query["WHERE"] = {NOT: allCondition[0]};
        } else {
            query["WHERE"] = allCondition[0];
        }
    } else {
        if (and) {
            query["WHERE"] = {AND: allCondition};
        } else if (or) {
            query["WHERE"] = {OR: allCondition};
        } else if (none) {
            query["WHERE"] = {NOT: {OR: allCondition}};
        }
    }

    // option part: column part
    let optionpart = {};
    let columnpart = [];
    let orderpart = {};
    let orderarray = [];

    let columns = panel.getElementsByClassName("form-group columns")[0]
        .getElementsByClassName("control-group")[0].children;

    for (const column of columns) {
        let check = column.getElementsByTagName("input")[0].checked;
        if (check) {
            if (column.className === "control field") {
                columnpart.push(dataset + "_" + column.getElementsByTagName("input")[0].value);
            } else if (column.className === "control transformation") {
                columnpart.push(column.getElementsByTagName("input")[0].value)
            }
        }
    }

    // option part: order part
    let orders = panel.getElementsByClassName("form-group order")[0]
        .getElementsByClassName("control-group")[0]
        .getElementsByClassName("control order fields")[0].getElementsByTagName("select")[0].children;

    let direction = panel.getElementsByClassName("form-group order")[0]
        .getElementsByClassName("control-group")[0]
        .getElementsByClassName("control descending")[0].getElementsByTagName("input")[0].checked;

    for (const order of orders) {
        if (order.selected) {
            if (order.className === "transformation") {
                orderarray.push(order.value);
            } else {
                orderarray.push(dataset + "_" + order.value);
            }
        }
    }
    orderpart["keys"] = orderarray;

    optionpart["COLUMNS"] = columnpart;
    if (!(!direction && orderarray.length === 0)) {
        if (direction) {
            orderpart["dir"] = "DOWN";
        } else if (!direction) {
            orderpart["dir"] = "UP";
        }
        orderpart["keys"] = orderarray;
        optionpart["ORDER"] = orderpart;
    }
    query["OPTIONS"] = optionpart;

    //transformation part: group part
    let grouparray = [];
    let applyarray = [];
    let transformationpart = {};

    let groups = panel.getElementsByClassName("form-group groups")[0]
        .getElementsByClassName("control-group")[0].children;
    let applies = panel.getElementsByClassName("form-group transformations")[0]
        .getElementsByClassName("transformations-container")[0].children;

    for (const group of groups) {
        let check = group.getElementsByTagName("input")[0].checked;
        if (check) {
            grouparray.push(dataset + "_" + group.getElementsByTagName("input")[0].value);
        }
    }
    // if (applies.length !== 0) {
    for (const apply of applies) {
        let inputTerm = apply.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;
        let token = apply.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0].value;
        let key = apply.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0].value;

        let applyobject = {};
        applyobject[inputTerm] = {[token]: dataset + "_" + key};
        applyarray.push(applyobject);
    }
    // }

    if (applyarray.length !== 0 || grouparray.length !== 0) {
        transformationpart["GROUP"] = grouparray;
        transformationpart["APPLY"] = applyarray;
        query["TRANSFORMATIONS"] = transformationpart;
    }

    return query;
};
