/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = function (query) {
    return new Promise(function (fulfill, reject) {
        // TODO: implement!
        let http = new XMLHttpRequest();

        http.open("POST", "/query", true);
        http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        http.onload = function () {
            if (http.responseText) {
                fulfill(JSON.parse(http.responseText));
            }
        };
        http.onerror = function () {
            reject("request error");
        };
        http.send(JSON.stringify(query));
    });
};
