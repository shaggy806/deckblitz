import { defineCard } from "../define.js";

// Aether Revolt. "For as long as you control this creature" is the
// `while-you-control-source` duration (Aegis Angel): it ends if the Spy leaves
// or changes control, and never begins if the Spy left before it resolved
// (its rulings).
const TEXT = 'When this creature enters, target artifact you control gains "{T}: Draw a card" for as long as you control this creature.';

export default defineCard({
  name: "Quicksmith Spy",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "grant-activated",
        target: 0,
        ability: {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "{T}: Draw a card.",
        },
        duration: "while-you-control-source",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
