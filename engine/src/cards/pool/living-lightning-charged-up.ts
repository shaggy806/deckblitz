import { defineCard } from "../define.js";

// EDHREC rank 29311.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, another target creature you control gets +1/+0 and gains haste until end of turn.";

export default defineCard({
  name: "Living Lightning, Charged Up",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text:
    "Flying (This creature can't be blocked except by creatures with flying or reach.)\n" +
    "Haste (This creature can attack and {T} as soon as he comes under your control.)\n" +
    COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
