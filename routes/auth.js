const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../wrapAsync");
const { body } = require("express-validator");
const { auth_login, auth_signup } = require("../controller/authController");
//login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  wrapAsync(auth_login)
);

// post user
router.post(
  "/signup",
  [
    body("firstName").not().isEmpty().withMessage("Please provide First Name"),
    body("email").isEmail().withMessage("Please include valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage(
        "Password must be 8 or more and less than 32 characters long"
      ),
    body("city").not().isEmpty().withMessage("Provide valid city name"),
  ],
  wrapAsync(auth_signup)
);

//logOut
router.post("/logout", (_req, res) => {
  res.clearCookie("jwt", { path: "/" });

  res.cookie("jwt", "", {
    maxAge: 1000 * 1,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged Out" });
});

module.exports = router;
