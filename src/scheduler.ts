import {cronModuleActions, getModules} from 'cron-module-actions';
import {GlobalCatcher} from "./utils/global-catcher";
import "elastic-apm-node/start";
import Scribal from "./utils/scribal";

GlobalCatcher();

export default (async () => {
  cronModuleActions(await getModules(`./dist/src/actions`));
})()
  .catch(e => {
    Scribal.i(`Scheduler Error outside the global catcher`, e);
  })