import {readFileSync} from "node:fs";
import {join, resolve} from "node:path";
import process from "process";
import {EmailNotificationSubjects} from "./templates/email-info";
import {format} from "node:util";
import {debug} from "../../../utils/logger-handler";

export class Templater {

  constructor() {
  }

  readonly basePath = "src/integrations/notifications/templates/handlebars/";

  getFilePath(file: string) {
    return this.basePath.concat(file);
  }

  compile(payload: any) {
    const templateData = {
      pageTitle: format(EmailNotificationSubjects[payload.template], payload.network.name),
      notificationTitleHeading: format(EmailNotificationSubjects[payload.template], payload.network.name),
      taskTitleParagraph: payload.title,
      actionHref: `https://app.bepro.network/${payload.network.name}/task/${payload.bountyId}/?fromEmail=${payload.uuid}`
    };

    Handlebars.registerPartial("styles", Handlebars.compile(this.getHtmlOf(this.getFilePath("partials/styles.hbs"))));
    Handlebars.registerPartial("logo", Handlebars.compile(this.getHtmlOf(this.getFilePath("partials/logo.hbs"))));

    return Handlebars.compile(this.html)(templateData, {allowProtoPropertiesByDefault: true});
  }

  get html() {
    return this.getHtmlOf("base-template.hbs");
  }

  private getHtmlOf(path: string) {
    const resolved = resolve(join(process.cwd(), this.getFilePath(path)))

    debug(`Templater reading ${resolved}`);

    return readFileSync(resolved, "utf-8");
  }


}