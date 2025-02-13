import "dotenv/config";

import axios from "axios";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
import loggerHandler from "../utils/logger-handler";

const {
  NEXT_IPFS_PROJECT_ID: id,
  NEXT_IPFS_PROJECT_SECRET: secret,
  NEXT_IPFS_UPLOAD_ENDPOINT: baseURL,
} = process.env;

const auth = "Basic " + Buffer.from(id + ":" + secret).toString("base64");

export async function add(file: Buffer | string,
                          pin = false,
                          originalFilename?: string,
                          ext?: string): Promise<{ hash: string; fileName: string; size: string }> {

  if ([id, secret, baseURL].some(v => !v)) {
    loggerHandler.warn(`Missing id, secret or baseURL, for IPFService`);
    return {hash: '', fileName: '', size: '0'};
  }

  const form = new FormData();

  const isBuffer = Buffer.isBuffer(file);

  const content = isBuffer ? Buffer.from(file) : file;

  if (isBuffer) {
    const options = {
      filename: originalFilename ? `${originalFilename}` : `${uuidv4()}.jpeg`,
      contentType: "image/jpeg",
    };

    form.append("file", content, options);
  } else {
    form.append("file", content, `${uuidv4()}.${ext}`);
  }

  const headers = {
    "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
    Accept: "*/*",
    Connection: "keep-alive",
    authorization: auth,
  };

  const { data } =
    await axios.post(`${baseURL}/add?stream-channels=true&progress=false&pin=${pin}`, form, {headers,});
  return { hash: data.Hash, fileName: data.Name, size: data.Size };
}

export default { add };
