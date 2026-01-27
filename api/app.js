import express from "express";
import cors from "cors";

import user from "./user/resources/auth.js"

const app = express();

app.use(express.json())
app.use(cors);

app.use("/user", user);

