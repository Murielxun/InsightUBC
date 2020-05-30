import { expect } from "chai";
import * as fs from "fs-extra";
// import {InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
// import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import {InsightDatasetKind} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        emptycourses: "./test/data/emptycourses.zip",
        oneinvalid1: "./test/data/oneinvalid1.zip",
        oneinvalid2: "./test/data/oneinvalid2.zip",
        onevalid: "./test/data/onevalid.zip",
        twoinvalid1: "./test/data/twoinvalid1.zip",
        twoinvalid2: "./test/data/twoinvalid2.zip",
        twoinvalid3: "./test/data/twoinvalid3.zip",
        twovalid1: "./test/data/twovalid1.zip",
        wovalid2: "./test/data/twovalid2.zip",
        wovalid3: "./test/data/twovalid3.zip",
        invalid_id: "./test/data/invalid_id.zip",
        invalidjson: "./test/data/invalidjson.zip",
        invalidpic: "./test/data/invalidpic.zip",
        invalidtxt: "./test/data/invalidtxt.zip",
        validfolders: "./test/data/validfolders.zip",
        invalidpdf: "./test/data/XinYue_Wang_Resume.pdf",
        invalidnocourses: "./test/data/invalidnocourses.zip",
        rooms: "./test/data/rooms.zip"
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
    });

    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    //
    // // test for adding a valid dataset with other folders
    // it("Should add a valid dataset with other folders", function () {
    //     const id: string = "validfolders";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((result: string[]) => {
    //             expect(result).to.deep.equal(expected);
    //         })
    //         .catch((err: any) => {
    //             expect.fail(err, expected, "Should not have rejected");
    //         });
    // });
    //
    //
    // // test of emptycourses.zip
    // it("Should not add an empty dataset", function () {
    //     const id: string = "emptycourses";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of invalidpdf
    // it("Should not add an pdf", function () {
    //     const id: string = "invalidpdf";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of datasetkind room
    // it("Should not add datasetkind room", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Rooms)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of invalidnocourses.zip
    // it("Should not add an dataset without courses folder", function () {
    //     const id: string = "invalidnocourses";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of invalidjson.zip
    // it("Should not add an invalidjson dataset", function () {
    //     const id: string = "invalidjson";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of invalidpic.zip
    // it("Should not add an invalidpic dataset", function () {
    //     const id: string = "invalidpic";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of invalidtxt.zip
    // it("Should not add an invalidtxt dataset", function () {
    //     const id: string = "invalidtxt";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of invalid_id.zip
    // it("Should not add invalid_id dataset", function () {
    //     const id: string = "invalid_id";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of whitespace
    // it("Should not add whitespace dataset", function () {
    //     const id: string = " ";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of oneinvalid1.zip
    // it("Should not add oneinvalid1 dataset", function () {
    //     const id: string = "oneinvalid1";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of oneinvalid2.zip
    // it("Should not add oneinvalid2 dataset", function () {
    //     const id: string = "oneinvalid2";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of add single valid dataset multiple times
    // it("Should not add a valid dataset multiple times", function () {
    //     const id: string = "onevalid";
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((res1) => {
    //             return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
    //         }).catch((res2) => {
    //             return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
    //         }).catch((res3) => {
    //             return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
    //         }).catch((res4) => {
    //             expect(res4).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of onevalid.zip
    // it("Should add a valid dataset", function () {
    //     const id: string = "onevalid";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((result: string[]) => {
    //             expect(result).to.deep.equal(expected);
    //         })
    //         .catch((err: any) => {
    //             expect.fail(err, expected, "Should not have rejected");
    //         });
    // });
    //
    // // test of twoinvalid1.zip
    // it("Should not add twoinvalid1 dataset", function () {
    //     const id: string = "twoinvalid1";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of twoinvalid2.zip
    // it("Should not add twoinvalid2 dataset", function () {
    //     const id: string = "twoinvalid2";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of twoinvalid3.zip
    // it("Should not add twoinvalid3 dataset", function () {
    //     const id: string = "twoinvalid3";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of null id
    // it("null id", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(null, datasets[id], InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of null insightdatasetkind
    // it("null insightdatasetkind", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], null)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of null content string
    // it("null content string", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, null, InsightDatasetKind.Courses)
    //         .then((err: any) => {
    //             expect.fail(err, expected, "Should not have accepted");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test of twovalid1.zip
    // it("Should add twovalid1 dataset", function () {
    //     const id: string = "twovalid1";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((result: string[]) => {
    //             expect(result).to.deep.equal(expected);
    //         })
    //         .catch((err: any) => {
    //             expect.fail(err, expected, "Should not have rejected");
    //         });
    // });
    //
    //
    // // test of twovalid2.zip
    // it("Should add twovalid2 dataset", function () {
    //     const id: string = "twovalid2";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((result: string[]) => {
    //             expect(result).to.deep.equal(expected);
    //         })
    //         .catch((err: any) => {
    //             expect.fail(err, expected, "Should not have rejected");
    //         });
    // });
    //
    // // test of twovalid3.zip
    // it("Should add twovalid3 dataset", function () {
    //     const id: string = "twovalid3";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((result: string[]) => {
    //             expect(result).to.deep.equal(expected);
    //         })
    //         .catch((err: any) => {
    //             expect.fail(err, expected, "Should not have rejected");
    //         });
    // });
    //
    // // test of adding two dataset, first valid, second invalid
    // it("Should not add second dataset if invalid", function () {
    //     const id: string = "onevalid";
    //     const id2: string = "emptycourses";
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((res1) => {
    //             return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
    //         }).catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    //
    // // test for failing to add two invalid dataset
    // it("Should not add any dataset", function () {
    //     const id: string = "invalid_id";
    //     const id2: string = "twoinvalid1";
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .catch((res1) => {
    //             return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
    //         }).catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test for failing to add two whitespace id
    // it("Should not add any dataset", function () {
    //     const id: string = " ";
    //     const id2: string = "  ";
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .catch((res1) => {
    //             return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
    //         }).catch((err) => {
    //             expect(err).to.be.instanceOf(InsightError);
    //         });
    // });
    //
    // // test for remove exist dataset with valid id from facade with two dataset
    // it("Should remove an existed valid dataset", function () {
    //     const id: string = "courses";
    //     const id2: string = "onevalid";
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((res1) => {
    //             return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
    //         }).then((res2) => {
    //             return insightFacade.removeDataset(id);
    //         }).then((result: string) => {
    //             expect(result).to.deep.equal(id);
    //         })
    //         .catch((err: any) => {
    //             expect.fail(err, id,  "Should not have rejected");
    //         });
    // });
    //
    // // test for persistence for different insightfacade
    // it("persistence", function () {
    //     const id: string = "courses";
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((res1) => {
    //             const insightFacade2: InsightFacade = new InsightFacade();
    //             return insightFacade2.listDatasets();
    //         }).then((res2) => {
    //             expect(res2.length).to.equal(1);
    //             expect(res2[0].numRows).to.equal( 64612);
    //         }).catch((err: any) => {
    //             expect.fail(err, id, "Should not have rejected");
    //         });
    // });
    //
    // // test for removing invalid the valid dataset after adding one valid and one invalid
    // it("Should not add second dataset if invalid", function () {
    //     const id: string = "onevalid";
    //     const id2: string = "emptycourses";
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((res1) => {
    //             return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
    //         }).catch((res2) => {
    //             return insightFacade.removeDataset(id2);
    //         }).catch((res3) => {
    //             return insightFacade.removeDataset(id);
    //         }).then((res4) => {
    //             expect(res4).to.deep.equal(id);
    //         }).catch((err: any) => {
    //             expect.fail(err, id, "Should not have rejected");
    //         });
    // });
    //
    // // test for remove non-existed dataset with valid id
    // it("Should not remove a non-existed dataset with valid id ", function () {
    //     const id: string = "courses";
    //     // const expected: string[] = [id];
    //     return insightFacade
    //         .removeDataset(id)
    //         .then((err: any) => {
    //             expect.fail(err, id, "Should not have fulfilled");
    //         })
    //         .catch((err) => {
    //             expect(err).to.be.instanceOf(NotFoundError);
    //         });
    // });
    //
    // // test for remove non-existed dataset with invalid id, add a valid dataset and then remove this valid dataset
    // it("Should not remove a non-existed dataset with invalid id ", function () {
    //     const id: string = "invalid_id";
    //     const id2: string = "courses";
    //     return insightFacade.removeDataset(id)
    //         .catch((res1) => {
    //             return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
    //         }).then((res2) => {
    //             return insightFacade.removeDataset(id2);
    //         }).then((res3) => {
    //             expect(res3).to.deep.equal(id2);
    //         }).catch((err: any) => {
    //             expect.fail(err, id2, "Should not have rejected");
    //         });
    // });
    //
    // // test for remove non-existed dataset with invalid id. add a valid dataset then remove it
    // it("Should not remove a non-existed dataset with invalid id 2", function () {
    //     const id: string = " ";
    //     const id2: string = "courses";
    //     return insightFacade.removeDataset(id)
    //         .catch((res1) => {
    //             return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
    //         }).then((res2) => {
    //             return insightFacade.removeDataset(id2);
    //         }).then((res3) => {
    //             expect(res3).to.deep.equal(id2);
    //         }).catch((err: any) => {
    //             expect.fail(err, id2, "Should not have rejected");
    //         });
    // });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
// describe("InsightFacade PerformQuery", () => {
//     const datasetsToQuery: { [id: string]: {path: string, kind: InsightDatasetKind} } = {
//         courses: {path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
//     };
//     let insightFacade: InsightFacade;
//     let testQueries: ITestQuery[] = [];
//
//     // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
//     before(function () {
//         Log.test(`Before: ${this.test.parent.title}`);
//
//         // Load the query JSON files under test/queries.
//         // Fail if there is a problem reading ANY query.
//         try {
//             testQueries = TestUtil.readTestQueries();
//         } catch (err) {
//             expect.fail("", "", `Failed to read one or more test queries. ${err}`);
//         }
//
//         // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
//         // Will fail* if there is a problem reading ANY dataset.
//         const loadDatasetPromises: Array<Promise<string[]>> = [];
//         insightFacade = new InsightFacade();
//         for (const id of Object.keys(datasetsToQuery)) {
//             const ds = datasetsToQuery[id];
//             const data = fs.readFileSync(ds.path).toString("base64");
//             loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
//         }
//         return Promise.all(loadDatasetPromises).catch((err) => {
//             /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
//              * for the purposes of seeing all your tests run.
//              * TODO For C1, remove this catch block (but keep the Promise.all)
//              */
//             return Promise.resolve("HACK TO LET QUERIES RUN");
//         });
//     });
//
//     beforeEach(function () {
//         Log.test(`BeforeTest: ${this.currentTest.title}`);
//     });
//
//     after(function () {
//         Log.test(`After: ${this.test.parent.title}`);
//     });
//
//     afterEach(function () {
//         Log.test(`AfterTest: ${this.currentTest.title}`);
//     });
//
//     // Dynamically create and run a test for each query in testQueries
//     // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
//     it("Should run test queries", function () {
//         describe("Dynamic InsightFacade PerformQuery tests", function () {
//             for (const test of testQueries) {
//                 it(`[${test.filename}] ${test.title}`, function (done) {
//                     insightFacade.performQuery(test.query).then((result) => {
//                         TestUtil.checkQueryResult(test, result, done);
//                     }).catch((err) => {
//                         TestUtil.checkQueryResult(test, err, done);
//                     });
//                 });
//             }
//         });
//     });
// });

// describe("InsightFacade List Dataset", function () {
//     // Reference any datasets you've added to test/data here and they will
//     // automatically be loaded in the 'before' hook.
//     const datasetsToLoad: { [id: string]: string } = {
//         courses: "./test/data/courses.zip",
//         emptycourses: "./test/data/emptycourses.zip",
//         oneinvalid1: "./test/data/oneinvalid1.zip",
//         oneinvalid2: "./test/data/oneinvalid2.zip",
//         onevalid: "./test/data/onevalid.zip",
//         twoinvalid1: "./test/data/twoinvalid1.zip",
//         twoinvalid2: "./test/data/twoinvalid2.zip",
//         twoinvalid3: "./test/data/twoinvalid3.zip",
//         twovalid1: "./test/data/twovalid1.zip",
//         wovalid2: "./test/data/twovalid2.zip",
//         wovalid3: "./test/data/twovalid3.zip",
//         invalid_id: "./test/data/invalid_id.zip",
//     };
//
//     let datasets: { [id: string]: string } = {};
//     let insightFacade: InsightFacade;
//     const cacheDir = __dirname + "/../data";
//
//     before(function () {
//         // This section runs once and loads all datasets specified in the datasetsToLoad object
//         // into the datasets object
//         Log.test(`Before all`);
//         for (const id of Object.keys(datasetsToLoad)) {
//             datasets[id] = fs
//                 .readFileSync(datasetsToLoad[id])
//                 .toString("base64");
//         }
//     });
//
//     beforeEach(function () {
//         // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
//         // This runs before each test, which should make each test independent from the previous one
//         Log.test(`BeforeTest: ${this.currentTest.title}`);
//         try {
//             fs.removeSync(cacheDir);
//             fs.mkdirSync(cacheDir);
//             insightFacade = new InsightFacade();
//         } catch (err) {
//             Log.error(err);
//         }
//     });
//
//     after(function () {
//         Log.test(`After: ${this.test.parent.title}`);
//     });
//
//     afterEach(function () {
//         Log.test(`AfterTest: ${this.currentTest.title}`);
//     });
//
//
//     // test for list a complete complex dataset
//     it("Should list the dataset with one complete zip", function () {
//         const id: string = "courses";
//         return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
//             .then((res1) => {
//                 return insightFacade.listDatasets();
//             }).then((res2) => {
//                 expect(res2.length).to.equal(1);
//                 expect(res2[0].numRows).to.equal( 64612);
//             }).catch((err: any) => {
//                 expect.fail(err, "Should not have rejected");
//             });
//     });
//
//     // test for list the dataset after trying to add an invalid dataset
//     it("Should list the empty dataset", function () {
//         const id: string = "invalid_id";
//         return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
//             .catch((res1) => {
//                 return insightFacade.listDatasets();
//             }).then((res2) => {
//                 expect(res2.length).to.equal(0);
//             }).catch((err: any) => {
//                 expect.fail(err, "Should not have rejected");
//             });
//     });
//
//     // test for list the dataset after trying to add an invalid dataset (whitespace)
//     it("Should list the empty dataset", function () {
//         const id: string = " ";
//         return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
//             .catch((res1) => {
//                 return insightFacade.listDatasets();
//             }).then((res2) => {
//                 expect(res2.length).to.equal(0);
//             }).catch((err: any) => {
//                 expect.fail(err, "Should not have rejected");
//             });
//     });
//
//     // test for list the dataset after trying to add an invalid dataset (whitespace2)
//     it("Should list the empty dataset", function () {
//         const id: string = "  ";
//         return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
//             .catch((res1) => {
//                 return insightFacade.listDatasets();
//             }).then((res2) => {
//                 expect(res2.length).to.equal(0);
//             }).catch((err: any) => {
//                 expect.fail(err, "Should not have rejected");
//             });
//     });
//
//     // test for list
//     it("Should list the dataset with multiple zip", function () {
//         const id: string = "onevalid";
//         const id2: string = "twovalid1";
//         return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
//             .then((res1) => {
//                 return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
//             }).then((res2) => {
//                 return insightFacade.listDatasets();
//             }).then((res3) => {
//                 expect(res3.length).to.equal(2);
//                 expect(res3[0].numRows).to.equal(1);
//                 expect(res3[1].numRows).to.equal(1);
//             }).catch((err: any) => {
//                 expect.fail(err, "Should not have rejected");
//             });
//     });
// });


