import { defineCard } from "../define.js";

// EDHREC rank 12772. Modern Horizons 2.
//
// Storm copies may choose new targets (rule 702.40a), each a creature its
// caster doesn't control.
export default defineCard({
  name: "Spreading Insurrection",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature you don't control until end of turn. Untap that creature. It gains haste until end of turn.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
