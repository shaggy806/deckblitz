import { defineCard } from "../define.js";

// EDHREC rank 28261.

export default defineCard({
  name: "Dal R'El, Augment Orphan",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mutant", "Rogue"],
  power: 3,
  toughness: 3,
  text: "Landfall — Whenever a land you control enters, add {R} or {G}.\n{3}, Sacrifice a land: Draw a card.",
  activated: [
    {
      cost: { mana: "{3}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{3}, Sacrifice a land: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Add {R}.", effect: { kind: "add-mana", mana: "R", amount: 1 } },
          { text: "Add {G}.", effect: { kind: "add-mana", mana: "G", amount: 1 } },
        ],
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, add {R} or {G}.",
    },
  ],
});
