class InvalidRequest extends Error {
  status: number;
  
  constructor(message = "InvalidRequest", status = 400) {
    super(message);
    this.name = "InvalidRequest";
    this.message = message;
    this.status = status;
  }
}

export { InvalidRequest };
