import * as Handlebars from "handlebars";
import {readFileSync} from "fs";

const folder = `./src/messages`;
const file = (template: string) => `${folder}${template}`

export const NEW_BOUNTY = (info) =>
  Handlebars.compile(readFileSync(file(`new-bounty.hbs`)))(info);

export const AMOUNT_AND_SYMBOL = (info) =>
  Handlebars.compile(readFileSync(file(`amount-symbol`)))(info);
