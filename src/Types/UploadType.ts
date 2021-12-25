import { Readable } from "stream";

interface UploadType {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Readable;
}

export default UploadType;
