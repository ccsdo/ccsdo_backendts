import fs from "fs";
import { Request,Response } from "express";
const track=(req:Request,res:Response)=>{
  try {
    // Your tracking logic here  
   const forwarded = req.headers["x-forwarded-for"];
  const ip =
  typeof forwarded === "string"
    ? forwarded.split(",")[0]
    : Array.isArray(forwarded)
    ? forwarded[0]
    : req.socket.remoteAddress;
// console.log(req)
  const log = {
       page: req.body.page ?? "unknown",
    referrer: req.body.referrer ?? "unknown",
    userAgent: req.body.userAgent ?? req.headers["user-agent"] ?? "unknown",
    time: req.body.time ?? new Date().toISOString(),
    ip: ip
  };
  

  fs.appendFile("visitors.log", `[${new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  })}]   ${JSON.stringify(log)}\n`, (err) => {
    if (err) console.error("Write error:", err);
  });

  res.json({ status: "logged" });   
  } catch (error) {
    console.error("Tracking error:", error);
    res.status(500).json({ success: false, message: "Tracking error" });
  }
};
export default track;