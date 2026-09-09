import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
   //Add your code here
});

// Add to cart
router.post("/", async (req, res) => {
   const session = await Session.findById(req.signedCookies.sid);
   // session.data.cart.push({
   //    courseId: req.body.courseId,
   //    quantity: 1,
   // });

   // session.markModified("data");

   // session.set("data.cart", [
   //    ...session.data.cart,
   //    {
   //       courseId: req.body.courseId,
   //       quantity: 1,
   //    },
   // ]);
   const sessionId = req.signedCookies.sid;
   const { courseId } = req.body;
   console.log({ sessionId, courseId });
   const result = await Session.updateOne(
      {
         _id: sessionId,
         "data.cart.courseId": courseId,
      },
      {
         $inc: {
            "data.cart.$.quantity": 1,
         },
      },
   );

   if (result.matchedCount == 0) {
      await Session.updateOne(
         { _id: sessionId },
         {
            $push: {
               "data.cart": { courseId, quantity: 1 },
            },
         },
      );
   }
   console.log({ result });

   // await result.save();
   console.log({ session: session.data.cart, body: req.body });
   res.status(201).json({ message: "course added to the cart" });
});

// Remove course from cart
router.delete("/:courseId", async (req, res) => {
   //Add your code here
});

// Clear cart
router.delete("/", async (req, res) => {
   //Add your code here
});

export default router;
