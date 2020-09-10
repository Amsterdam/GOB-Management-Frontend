import {ALIVE_INTERVAL, ANONYMOUS_THREAD, isAlive, isRunning, taskName} from "./status";

beforeEach(() => jest.resetModules());

it("provides the services", async () => {
    let mockServices = jest.fn()
    let mockTasks = jest.fn(async () => ({
        tasks: {
            edges: [
                {
                    node: {

                    }
                }
            ]
        }
    }))
    jest.mock("../graphql/queries", () => ({
        queryServices: mockServices,
        queryTasks: mockTasks
    }))

    const {services} = require("./status")

    mockServices.mockImplementation(jest.fn(async () => -1))
    let result = await services()
    expect(result.BeheerAPI.isAlive).toEqual(false)

    mockServices.mockImplementation(jest.fn(async () => ({
        services: {
            edges: [
                {
                    node: {
                        name: "any service",
                        timestamp: new Date(),
                    }
                },
                {
                    node: {
                        name: "any service",
                        timestamp: new Date(),
                        isAlive: false
                    }
                },
                {
                    node: {
                        name: "Workflow",
                        timestamp: new Date(),
                        isAlive: true
                    }
                },
            ]
        }
    })))
    let expected = {
        BeheerAPI: expect.anything(),
        IRIS: expect.anything(),
        Workflow: expect.anything(),
        "any service": expect.anything()
    }
    result = await services()
    expect(result).toEqual(expected)
    expect(result.BeheerAPI.isAlive).toEqual(true)
    expect(result["any service"].isAlive).toEqual(false)

    mockServices.mockImplementation(jest.fn(async () => ({
        services: {
            edges: []
        }
    })))
    expected = {
        BeheerAPI: expect.anything(),
        IRIS: expect.anything(),
        Workflow: expect.anything()
    }
    result = await services()
    expect(result).toEqual(expected)
    expect(result.BeheerAPI.isAlive).toEqual(true)
})

it("provides for a task name", () => {
    expect(taskName({name: "any name"})).toEqual(ANONYMOUS_THREAD)
    expect(taskName({name: "Eventloop"})).not.toEqual(ANONYMOUS_THREAD)
})

it("tells if a service is running", () => {
    const service = {
        tasks: []
    }
    expect(isRunning(null)).toEqual(false)
    expect(isRunning(service)).toEqual(false)
    service.tasks = [{name: "any name"}]
    expect(isRunning(service)).toEqual(false)
    service.tasks.push({name: "MessageHandler"})
    expect(isRunning(service)).toEqual(true)
})

it("tells if a service is alive", () => {
    expect(isAlive(null)).toBeFalsy()
    const service = {
        isAlive: false
    }
    expect(isAlive(service)).toEqual(false)
    service.isAlive = true
    expect(isAlive(service)).toEqual(false)
    service.age = ALIVE_INTERVAL - 1
    expect(isAlive(service)).toEqual(true)
    service.age = ALIVE_INTERVAL
    expect(isAlive(service)).toEqual(true)
    service.age = ALIVE_INTERVAL + 1
    expect(isAlive(service)).toEqual(false)
})
