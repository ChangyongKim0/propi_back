export class ErrorClass {
  text: string;
  validation_code: "198462735";
  constructor(text: string) {
    this.text = text;
    this.validation_code = "198462735";
  }
}

export const _stringfy = (data: unknown): string => {
  if (typeof data === "string") {
    return data;
  }
  return "";
};
