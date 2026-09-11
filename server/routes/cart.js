import express from "express";
import Session from "../models/Session.js";
import Course from "../models/Course.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
   const sessionId = req.signedCookies.sid;
   const session =
      await Session.findById(sessionId).populate("data.cart.courseId");
   // console.log({ session: session.data.cart });

   if (!session.userId) {
      const cartCourses = session.data.cart.map(({ courseId, quantity }) => {
         const { id, name, image, price } = courseId;
         return {
            id,
            name,
            image,
            price,
            quantity,
         };
      });
      return res.json(cartCourses);
   }

   const data = await Cart.findOne({ userId: session.userId }).populate(
      "courses.courseId",
   );

   const cartCourses = data.courses.map(({ courseId, quantity }) => {
      const { id, name, image, price } = courseId;
      return {
         id,
         name,
         image,
         price,
         quantity,
      };
   });
   return res.json(cartCourses);
});

// Add to cart
router.post("/", async (req, res) => {
   // const session = await Session.findById(req.signedCookies.sid);
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
   const session = await Session.findById(sessionId);
   if (session.userId) {
      const result = await Cart.updateOne(
         {
            userId: session.userId,
            "courses.courseId": courseId,
         },
         {
            $inc: {
               "courses.$.quantity": 1,
            },
         },
      );

      if (result.matchedCount == 0) {
         await Cart.updateOne(
            { userId: session.userId },
            {
               $push: {
                  courses: { courseId, quantity: 1 },
               },
            },
         );
      }
      return res.status(201).json({ message: "course added to the cart" });
   }

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

   // await result.save();

   res.status(201).json({ message: "course added to the cart" });
});

// Remove course from cart
router.delete("/:courseId", async (req, res) => {
   const sessionId = req.signedCookies.sid;
   const { courseId } = req.params;
   const result = await Session.updateOne(
      { _id: sessionId },
      {
         $pull: {
            "data.cart": { courseId },
         },
      },
   );

   res.json({ message: "Cart item removed" });
});

// Clear cart
router.delete("/", async (req, res) => {
   //Add your code here
});

export default router;
