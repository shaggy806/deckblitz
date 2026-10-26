import { defineCard } from "../define.js";

// A 1/1 green Wolf creature token with "This token gets +1/+1 for each card named Sound the
// Call in each graveyard." (Sound the Call). Its ability names the card, so the card is
// part of what the token is. No token printing on Scryfall.

const TEXT = "This token gets +1/+1 for each card named Sound the Call in each graveyard.";

export default defineCard({
  name: "Wolf Token (Sound the Call)",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { name: "Sound the Call" }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
