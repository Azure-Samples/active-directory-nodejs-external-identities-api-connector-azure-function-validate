module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request v1.");
  const API_VERSION = "1.0.0";

  // parse Basic Auth username and password
  var header = req.headers["authorization"] || "", // get the header
    token = header.split(/\s+/).pop() || "", // and the encoded auth token
    auth = new Buffer.from(token, "base64").toString(), // convert from base64
    parts = auth.split(/:/), // split on colon
    username = parts[0],
    password = parts[1];

  // Check for HTTP Basic Authentication, return HTTP 401 error if invalid credentials.
  if (
    username !== process.env["BASIC_AUTH_USERNAME"] ||
    password !== process.env["BASIC_AUTH_PASSWORD"]
  ) {
    context.res = {
      status: 401,
    };
    context.log("Invalid Authentication");
    return;
  }

  // If input data is null, return error.
  const INVALID_REQUEST = {
    status: 400,
    body: {
      version: API_VERSION,
      code: "INVALID_REQUEST",
    },
  };

  if (!(req.body && req.body.email && req.body.email.contains("@"))) {
    context.res = INVALID_REQUEST;
    context.log("Invalid Request");
    return;
  }

  // Log the request body
  context.log(`Request body: ${JSON.stringify(req.body)}`);

  // Get the current user language
  var language = req.body.ui_locales ? "default" : req.body.ui_locales;
  context.log(`User language: ${language}`);

  // get domain of email address
  const domain = req.body.email.split("@")[1];
  const allowedDomains = ["fabrikam.com", "farbicam.com"];

  // Check that the domain of the email is from a specific other tenant
  if (allowedDomains.includes(domain.toLowerCase())) {
    context.res = {
      body: {
        version: API_VERSION,
        action: "ShowBlockPage",
        userMessage:
          "You must have an account from a valid domain to register as an external user for Contoso.",
        code: "SignUp-BlockByEmailDomain-0",
      },
    };
    context.log(context.res);
    return;
  }

  // Validate the 'Job Title', if provideed, to ensure it's at least 4 characters.
  if (req.body.jobTitle && req.body.jobTitle.length < 5) { //use !req.body.jobTitle to require jobTitle
      context.res = {
        status: 400,
        body: {
          version: API_VERSION,
          action: "ValidationError",
          status: 400,
          userMessage: "Please provide a job title with at least 5 characters.",
          code: "SingUp-Input-Validation-0",
        },
      };
  }

  // Email domain and user collected attribute are valid, return continuation response.
  context.res = {
    body: { version: API_VERSION, action: "Continue" },
  };

  context.log(context.res);
  return;
};
