import {services as _getServices} from "../../../services/status";
import {isRunning, taskName, ANONYMOUS_THREAD} from "../../../services/status";

export function getTaskName(task) {
    return taskName(task);
}

export function getTasks(instance) {
    return Object.values(
        instance.tasks
            .map(t => {
                t.taskname = getTaskName(t);
                return t;
            })
            .filter(t => t.taskname !== ANONYMOUS_THREAD)
            .reduce((r, t) => {
                const name = t.taskname;
                if (!r[name]) {
                    r[name] = t;
                    r[name].count = 0;
                }
                r[name].isAlive = r[name].isAlive && t.isAlive;
                r[name].count += 1;
                return r;
            }, {})
    );
}

export function isServiceRunning(service) {
    return isRunning(service);
}

export async function getServices() {
    const services = await _getServices()
    return Object.keys(services)
        .filter(key => services[key].serviceId)
        .reduce((obj, key) => {
            obj[key] = services[key];
            return obj;
        }, {});
}
