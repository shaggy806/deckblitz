import { defineCard } from "../define.js";

// EDHREC rank 12343.
//
// A Wizard spell is one with the creature type Wizard (the ruling) — a
// creature spell, or a Kindred one; `subtype` reads it through changeling.

const TEXT = "Whenever you cast an instant, sorcery, or Wizard spell, this creature deals 1 damage to any target.";

export default defineCard({
  name: "Rockslide Sorcerer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Wizard" }] },
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
