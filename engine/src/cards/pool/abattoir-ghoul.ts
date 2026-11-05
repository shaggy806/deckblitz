import { defineCard } from "../define.js";

// EDHREC rank 20445.
//
// Sengir Vampire's trigger; the creature's toughness is read as it last existed
// on the battlefield (the ruling).
const TEXT = "Whenever a creature dealt damage by this creature this turn dies, you gain life equal to that creature's toughness.";

export default defineCard({
  name: "Abattoir Ghoul",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
