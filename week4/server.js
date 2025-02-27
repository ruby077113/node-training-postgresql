require("dotenv").config();
const http = require("http");
const AppDataSource = require("./db");

const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Length, X-Requested-With",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
  "Content-Type": "application/json",
};

function isUndefined(value) {
  return value === undefined;
}

function isNotValidSting(value) {
  return typeof value !== "string" || value.trim().length === 0 || value === "";
}

function isNotValidInteger(value) {
  return typeof value !== "number" || value < 0 || value % 1 !== 0;
}

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      const packages = await AppDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"],
      });
      responseSuccessHandler(res, packages);
    } catch (error) {
      errorResponseHandler(res);
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (
          isUndefined(data.name) ||
          isNotValidSting(data.name) ||
          isUndefined(data.credit_amount) ||
          isNotValidInteger(data.credit_amount) ||
          isUndefined(data.price) ||
          isNotValidInteger(data.price)
        ) {
          errorResponseHandler(res, 400, "欄位未填寫正確");
          return;
        }
        const creditPackage = AppDataSource.getRepository("CreditPackage");
        const existPackage = await creditPackage.find({
          where: {
            name: data.name,
          },
        });
        if (existPackage.length > 0) {
          errorResponseHandler(res, 409, "資料重複");
          return;
        }
        const newPackage = creditPackage.create({
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price,
        });
        const result = await creditPackage.save(newPackage);
        responseSuccessHandler(res, result);
      } catch (error) {
        errorResponseHandler(res);
      }
    });
  } else if (
    req.url.startsWith("/api/credit-package/") &&
    req.method === "DELETE"
  ) {
    try {
      const packageId = req.url.split("/")[3];
      if (isUndefined(packageId) || isNotValidSting(packageId)) {
        errorResponseHandler(res, 400, "ID錯誤");
        return;
      }
      const result = await AppDataSource.getRepository("CreditPackage").delete(
        packageId
      );
      if (result.affected === 0) {
        errorResponseHandler(res, 400, "ID錯誤");
        return;
      }
      responseSuccessHandler(res);
    } catch (error) {
      errorResponseHandler(res);
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "GET") {
    try {
      const Skills = await AppDataSource.getRepository("Skill").find({
        select: ["id", "name"],
      });
      responseSuccessHandler(res, Skills);
    } catch (error) {
      console.log(error);
      errorResponseHandler(res);
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (isUndefined(data.name) || isNotValidSting(data.name)) {
          errorResponseHandler(res, 400, "欄位未填寫正確");
          return;
        }
        const Skills = AppDataSource.getRepository("Skill");
        const existSkills = await Skills.find({
          where: {
            name: data.name,
          },
        });
        if (existSkills.length > 0) {
          errorResponseHandler(res, 409, "資料重複");
          return;
        }
        const newSkills = Skills.create({
          name: data.name,
        });
        const result = await Skills.save(newSkills);
        responseSuccessHandler(res, result);
      } catch (error) {
        errorResponseHandler(res);
      }
    });
  } else if (
    req.url.startsWith("/api/coaches/skill/") &&
    req.method === "DELETE"
  ) {
    try {
      const skillId = req.url.split("/")[4];
      if (isUndefined(skillId) || isNotValidSting(skillId)) {
        errorResponseHandler(res, 400, "ID錯誤");
        return;
      }
      const result = await AppDataSource.getRepository("Skill").delete(skillId);
      if (result.affected === 0) {
        errorResponseHandler(res, 400, "ID錯誤");
        return;
      }
      responseSuccessHandler(res);
    } catch (error) {
      console.log("error", error);

      errorResponseHandler(res);
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    errorResponseHandler(res, 404);
  }
};

const server = http.createServer(requestListener);

async function startServer() {
  await AppDataSource.initialize();
  console.log("資料庫連接成功");
  server.listen(process.env.PORT);
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`);
  return server;
}

module.exports = startServer();

function responseSuccessHandler(res, data = null) {
  res.writeHead(200, headers);
  res.write(
    JSON.stringify({
      status: "success",
      data,
    })
  );
  res.end();
}

function errorResponseHandler(res, statusCode = 500, message = "伺服器錯誤") {
  res.writeHead(statusCode, headers);
  switch (statusCode) {
    case 400:
      res.write(
        JSON.stringify({
          status: "failed",
          message,
        })
      );
      break;
    case 404:
      res.write(
        JSON.stringify({
          status: "failed",
          message: "無此網站路由",
        })
      );
      break;
    case 409:
      res.write(
        JSON.stringify({
          status: "failed",
          message: "資料重複",
        })
      );
      break;
    default:
      res.write(
        JSON.stringify({
          status: "error",
          message: message,
        })
      );
  }

  res.end();
}
