const { OAuth2Client } = require("google-auth-library");
const https = require("https");
const jwt = require("jsonwebtoken");
const usertable = require("../../Models/usertable.js");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const secretKey = process.env.JWT_SECRET || "12345678910";

const fetchGoogleProfile = (accessToken) =>
  new Promise((resolve, reject) => {
    const request = https.request(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            if (response.statusCode >= 200 && response.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              reject(new Error(`Failed to fetch profile: ${response.statusCode}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", (error) => reject(error));
    request.end();
  });

const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).send({ status: "failed", message: "Missing Google identity token" });
    }

    let profileBody;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      profileBody = ticket.getPayload();
    } else {
      const tokenInfo = await googleClient.getTokenInfo(accessToken);
      profileBody = {
        sub: tokenInfo.sub,
        email: tokenInfo.email,
      };

      try {
        const enrichedProfile = await fetchGoogleProfile(accessToken);
        profileBody = { ...enrichedProfile, ...profileBody };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("Failed to enrich Google profile", error.message);
      }
    }

    if (!profileBody) {
      return res.status(401).send({ status: "failed", message: "Invalid Google credential" });
    }

    const {
      sub: googleId,
      email,
      given_name: givenName,
      family_name: familyName,
      name,
      picture,
    } = profileBody;

    if (!email) {
      return res.status(400).send({ status: "failed", message: "Google account email not available" });
    }

    let user = await usertable.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      const derivedFirstName = givenName || (name ? name.split(" ")[0] : "Google");
      const derivedLastName =
        familyName ||
        (name
          ? name
            .split(" ")
            .slice(1)
            .join(" ")
          : "User");

      user = await usertable.create({
        first_name: derivedFirstName,
        last_name: derivedLastName || "User",
        email,
        authProvider: "google",
        googleId,
        avatar: picture || null,
        status: "Active",
      });
    } else {
      const updates = {};

      if (!user.googleId && googleId) {
        updates.googleId = googleId;
      }

      if (!user.avatar && picture) {
        updates.avatar = picture;
      }

      if (!user.password) {
        updates.authProvider = "google";
      }

      if (Object.keys(updates).length > 0) {
        user = await usertable.findByIdAndUpdate(user._id, updates, { new: true });
      }
    }

    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "100h" });

    return res.status(200).send({
      status: "successfull",
      message: "Login successful",
      token,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Google auth failed", error);
    return res.status(500).send({
      status: "failed",
      message: "Google authentication failed",
      detail: error?.message,
    });
  }
};

module.exports = googleAuth;
