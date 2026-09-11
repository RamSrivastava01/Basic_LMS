import express from "express";
import Course from "../models/Course.js";
import Session from "../models/Session.js";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
   try {
      const courses = await Course.find();
      const { sid } = req.signedCookies;

      const session = await Session.findById(sid);
      if (!session) {
         const session = await Session.create({});
         res.cookie("sid", session.id, {
            httpOnly: true,
            signed: true,
            maxAge: 60 * 60 * 1000 * 24 * 30,
         });
      }

      res.json(courses);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

export default router;
