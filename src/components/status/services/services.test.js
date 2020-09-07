beforeEach(() => jest.resetModules());

it("should provide task info", async () => {
    const mockServices = jest.fn(async () => ({
        service: {
            serviceId: "any id",
        },
        otherService: {}
    }))
    const mockIsRunning = jest.fn(() => "is running")
    const mockTaskName = jest.fn(task => task.name)

    jest.mock("../../../services/status", () => ({
        services: mockServices,
        isRunning: mockIsRunning,
        taskName: mockTaskName,
        ANONYMOUS_THREAD: "ANY ANONYMOUS THREAD"
    }))

    const {getTaskName, getTasks, isServiceRunning, getServices} = require("./services")

    expect(getTaskName({name: "any task"})).toEqual("any task")
    expect(mockTaskName).toHaveBeenCalledWith({name: "any task"})

    const instance = {
        tasks: [
            {name: "any task", isAlive: true},
            {name: "any task", isAlive: true},
            {name: "ANY ANONYMOUS THREAD"},
            {}
        ]
    }
    expect(getTasks(instance)).toEqual([
        {
            count: 2,
            isAlive: true,
            name: "any task",
            taskname: "any task"
        },
        {
            count: 1,
            isAlive: undefined,
            name: undefined,
            taskname: undefined
        },
    ])

    expect(isServiceRunning("any service")).toEqual("is running")
    expect(mockIsRunning).toHaveBeenCalledWith("any service")

    expect(await getServices()).toEqual({"service": {"serviceId": "any id"}})




})