import { defineCard } from "../define.js";

// EDHREC rank 30974.
//
// Only a creature that is both an Eldrazi and a Scion is kept out (the
// ruling): `subtype` and `subtypes` must both hold.
const TEXT = "This creature can't be blocked by Eldrazi Scions.";

export default defineCard({
  name: "Kor Castigator",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Wizard", "Ally"],
  power: 3,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { type: "creature", subtype: "Eldrazi", subtypes: ["Scion"] },
      text: TEXT,
    },
  ],
});
