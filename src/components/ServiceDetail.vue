<template>
  <div>
    <div>
      <h4>Services</h4>
      <b-container>
        <b-row class="justify-content-center">
          <div
            v-for="service in services"
            :key="service.serviceId"
            v-if="service.instances"
          >
            <!--Service, e.g. Workflow-->
            <div
              v-for="(instance, i) in service.instances.filter(
                i => i.tasks.length > 0
              )"
              :key="instance.serviceId"
            >
              <b-col class="mb-2">
                <div class="pl-1 pr-1 border">
                  <!--Service Instance, e.g. Workflow(3)-->
                  <div>
                    {{ instance.name }}
                    <span v-if="service.instances.length > 1"
                      >({{ i + 1 }})</span
                    >
                    <font-awesome-icon
                      v-if="isRunning(instance)"
                      icon="cog"
                      class="fa-spin"
                    />
                  </div>
                  <!--Service task, e.g. Queue handler-->
                  <div
                    v-for="task in tasks(instance)"
                    :key="task.name"
                    class="small"
                    :class="task.isAlive ? 'INFO' : 'ERROR'"
                  >
                    {{ taskname(task) }}
                    <span v-if="task.count > 1">({{ task.count }})</span>
                  </div>
                </div>
              </b-col>
            </div>
          </div>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import { isRunning, taskName, ANONYMOUS_THREAD } from "../services/status";

export default {
  name: "ServiceDetail",
  props: {
    services: Object
  },
  methods: {
    taskname(task) {
      return taskName(task);
    },
    tasks(instance) {
      return Object.values(
        instance.tasks
          .map(t => {
            t.taskname = this.taskname(t);
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
    },
    isRunning(service) {
      return isRunning(service);
    }
  }
};
</script>

<style lang="scss" scoped></style>
