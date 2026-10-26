import { defineCard } from "../define.js";

// EDHREC rank 26365. Quakefoot Cyclops's shape: zero, one or two targets.

const ENTERS_TEXT = "When this creature enters, up to two target creatures can't block this turn.";

export default defineCard({
  name: "Markov Warlord",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste (This creature can attack and {T} as soon as it comes under your control.)\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          { kind: "restrict", target: 1, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
