import http from "http";
import env from "../configs/env.js";
import logger from "../util/logger.js";
import routes from "./routes.js";
import { parse } from "url";

const { HTTP_PORT } = env;

http
  .createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true); // URL 분석
    let body = "";
    // 요청 데이터 수집 (스트림 방식)
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      const route = routes[parsedUrl.pathname];
      let statusCode = 404;
      let result = {};

      try {
        if (!route || route.method != req.method) {
          result = { message: "API Not Found" };
        } else {
          let rcvData = {};

          if (body == "") {
            rcvData = parsedUrl.query;
          } else {
            rcvData = JSON.parse(body);
          }
          [statusCode, result] = await route.service(rcvData);
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          // JSON 파싱 오류일 경우
          statusCode = 400;
          result = { message: "Invalid JSON format" };
        } else {
          // 기타 오류
          statusCode = 500;
          result = { message: "Internal Server Error" };
          logger.error(error);
        }
      } finally {
        res.writeHead(statusCode, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify(result));
      }
    });
  })
  .listen(HTTP_PORT, () => {
    logger.info("Created HTTP SERVER");
  });
