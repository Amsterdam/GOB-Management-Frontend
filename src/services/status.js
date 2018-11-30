import { queryServices } from "../graphql/queries";

export const SERVICES = ["Workflow", "Import", "Upload", "Export"];

export const ALIVE_INTERVAL = 60;

export async function services() {
  const now = new Date();
  const nowUTC = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );

  const BeheerAPI = {
    name: "BeheerAPI",
    timestamp: nowUTC,
    isAlive: true,
    age: 0
  };
  const IRIS = {
    name: "IRIS",
    timestamp: nowUTC,
    isAlive: true,
    age: 0
  };
  const missingWorkflow = {
    name: "Workflow",
    timestamp: nowUTC,
    isAlive: false,
    age: ALIVE_INTERVAL * 2
  };

  var result = {};
  try {
    var allServices = await queryServices();
    result = allServices.services.edges
      .map(edge => edge.node)
      .map(service => {
        const timestamp = new Date(service.timestamp);
        service.age = (nowUTC - timestamp) / 1000;
        service.isAlive = service.isAlive && service.age <= ALIVE_INTERVAL;
        return service;
      })
      .reduce((obj, service) => {
        obj[service.name] = service;
        return obj;
      }, {});
    if (!(result.Workflow && result.Workflow.isAlive)) {
      // Without living Workflow nothing is known about the state of GOB
      result = {
        Workflow: missingWorkflow
      };
    }
  } catch (err) {
    BeheerAPI.isAlive = false;
    BeheerAPI.age = ALIVE_INTERVAL * 2;
  }
  return {
    ...result,
    BeheerAPI,
    IRIS
  };
}

export function isAlive(service) {
  return service && service.isAlive && service.age <= ALIVE_INTERVAL;
}
