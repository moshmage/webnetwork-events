import 'dotenv/config';
import * as Handlebars from "handlebars";
import {readFileSync} from "fs";

const env_folder = process.env.TELEGRAM_TEMPLATE_FOLDER;
const folder = env_folder || `./src/messages/integrations/telegram/messages-templates`;
const file = (template: string) => `${folder}${template}`

export const _NEW_BOUNTY = (info) =>
  Handlebars.compile(readFileSync(file(`new-bounty.hbs`)))(info);

export const AMOUNT_AND_SYMBOL = (info) =>
  Handlebars.compile(readFileSync(file(`amount-symbol.hbs`)))(info);

export const _BOUNTY_STATE_CHANGED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-state-changed.hbs`)))(info);

export const _BOUNTY_AMOUNT_UPDATED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-amount-changed.hbs`)))(info);

export const _PULL_REQUEST_OPEN = (info) =>
  Handlebars.compile(readFileSync(file(`pull-request-open.hbs`)))(info);

export const _PULL_REQUEST_CANCELED = (info) =>
  Handlebars.compile(readFileSync(file(`pull-request-canceled.hbs`)))(info);

export const _PROPOSAL_CREATED = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-created.hbs`)))(info);

export const _PROPOSAL_DISPUTED = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-disputed.hbs`)))(info);

export const _PROPOSAL_DISPUTED_COMPLETE = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-disputed-complete.hbs`)))(info);

export const _PROPOSAL_READY = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-ready.hbs`)))(info);

export const _BOUNTY_CLOSED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-closed.hbs`)))(info);

export const _BOUNTY_FUNDED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-funded.hbs`)))(info);
