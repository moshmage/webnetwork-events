import {readFileSync} from "node:fs";
import {join, resolve} from "node:path";
import process from "process";
import {EmailNotificationSubjects} from "./templates/email-info";
import {format} from "node:util";
import {debug} from "../../../utils/logger-handler";
import Handlebars from "handlebars";

export class Templater {

  constructor() {
  }

  readonly basePath = "src/integrations/send-grid/notifications/templates/handlebars/";

  getFilePath(file: string) {
    return this.basePath.concat(file);
  }


  get html() {
    return this.getHtmlOf("base-template.hbs");
  }

  compile(payload: any) {

    const title = format(EmailNotificationSubjects[payload.template], payload?.network?.name ?? "BEPRO");

    const templateData = {
      pageTitle: title,
      notificationTitleHeading: title,
      taskTitleParagraph: payload.title,
      actionHref: `https://app.bepro.network/${payload?.network?.name ?? "BEPRO"}/task/${payload.bountyId}/?fromEmail=${payload.uuid}`
    };

    Handlebars.registerPartial("styles", Handlebars.compile(this.getHtmlOf("partials/styles.hbs")));
    Handlebars.registerPartial("logo", Handlebars.compile(this.getHtmlOf("partials/logo.hbs")));

    return Handlebars.compile(this.html)(templateData, {allowProtoPropertiesByDefault: true});
  }

  private getHtmlOf(path: string) {
    const resolved = resolve(join(process.cwd(), this.getFilePath(path)))

    debug(`Templater reading ${resolved}`);

    return readFileSync(resolved, "utf-8");
  }

}