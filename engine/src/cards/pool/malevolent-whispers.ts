import { defineCard } from "../define.js";

// EDHREC rank 14716. Act of Treason with +2/+0, and madness.
//
// Rulings:
//   Malevolent Whispers can target any creature, even one that's untapped or one you already
//     control.

const EFFECT_TEXT =
  "Gain control of target creature until end of turn. Untap that creature. It gets +2/+0 and gains haste until end of turn.";

export default defineCard({
  name: "Malevolent Whispers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  madness: { cost: "{3}{R}" },
  text: `${EFFECT_TEXT}\nMadness {3}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
