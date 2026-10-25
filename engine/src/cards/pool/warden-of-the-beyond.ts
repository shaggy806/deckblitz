import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 31679.
//
// Rulings:
//   [2014-07-18] Warden of the Beyond can't get more than +2/+2 from its last ability, no matter
//     how many opponents own a card in exile or how many exiled cards they own.
export default defineCard({
  name: "Warden of the Beyond",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\nThis creature gets +2/+2 as long as an opponent owns a card in exile.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-exile", atLeast: 1, filter: { ownedBy: "opponent" } },
      grantPt: [2, 2],
      text: "This creature gets +2/+2 as long as an opponent owns a card in exile.",
    },
  ],
});
