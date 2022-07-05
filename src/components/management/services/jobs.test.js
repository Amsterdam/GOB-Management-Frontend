import {canStartJob} from "./jobs";
import {catalogOnlyJobs, collectionOptionalJobs} from "../../../services/gob";

beforeEach(() => jest.resetModules());

it("should provide for catalog collections", async () => {
    const mockGetCatalogCollections = jest.fn(() => ({}))
    jest.mock("../../../services/gob", () => ({
        getCatalogCollections: mockGetCatalogCollections
    }))

    const {getCatalogCollections} = require("./jobs")
    expect(await getCatalogCollections()).toEqual({})

    mockGetCatalogCollections.mockImplementation(() => ({
        rel: "rel",
        test_catalogue: "test catalogue",
        qa: "qa",
        any_catalog: "any catalog",
        wkpb: "wkpb",
    }))
    expect(await getCatalogCollections()).toEqual({
        any_catalog: "any catalog"
    })
})

it("should tell if a job can be started", () => {
    expect(canStartJob("", "any catalog", "any collection")).toBeFalsy()
    expect(canStartJob("any action", "any catalog", "any collection")).toBeTruthy()
    catalogOnlyJobs.map(action => action.toUpperCase()).forEach(action => {
        expect(canStartJob(action, "any catalog", "any collection")).toBeTruthy()
        expect(canStartJob(action, "any catalog", "")).toBeTruthy()
    })
    collectionOptionalJobs.forEach(action => {
        expect(canStartJob(action, "any catalog", "any collection")).toBeTruthy()
        expect(canStartJob(action, "any catalog", "")).toBeTruthy()
    })
    expect(canStartJob("any action", "any catalog", "")).toBeFalsy()
    expect(canStartJob("any action", "", "any collection")).toBeFalsy()
    expect(canStartJob("any action", "", "")).toBeFalsy()
})

it("should be able to start a job", async () => {
    const mockAuth = {
        userInfo: jest.fn(async () => null)
    }
    jest.mock("../../../services/auth", () => mockAuth)

    const mockCreateJob = jest.fn(async () => ({}))
    jest.mock("../../../services/gob", () => ({
        createJob: mockCreateJob
    }))

    const {startJob} = require("./jobs")

    expect(await startJob("any action",
        "any catalog",
        "any collection",
        "any product")).toEqual({"text": "any action any catalog {collection} failed"})

    mockAuth.userInfo.mockImplementation(async () => ({preferred_username: "any preferred username"}))
    expect(await startJob("any action",
        "any catalog",
        "any collection",
        "any product")).toEqual({"text": "any action any catalog {collection} failed"})

    mockCreateJob.mockImplementation(async () => ({ok: true, text: '{"_x": "x", "_y": "y"}'}))
    expect(await startJob("any action",
        "any catalog",
        "any collection",
        "any product")).toEqual({"ok": true, "text": "any action x y started"})

})