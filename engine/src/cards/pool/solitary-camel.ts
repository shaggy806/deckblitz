import { defineCard } from "../define.js";

// EDHREC rank 27859.
//
// Rulings:
//   [2017-07-14] Having more than one Desert doesn't matter, and there's no extra bonus for both
//     controlling one and having one in your graveyard.

export default defineCard({
  name: "Solitary Camel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Camel"],
  power: 3,
  toughness: 2,
  text: "This creature has lifelink as long as you control a Desert or there is a Desert card in your graveyard. (Damage dealt by this creature also causes you to gain that much life.)",
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      grantKeywords: ["lifelink"],
      text: "This creature has lifelink as long as you control a Desert or there is a Desert card in your graveyard.",
    },
  ],
});
