import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 23413.
//
// Rulings:
//   You may target a creature you already control: you gain control of it, untap it, and it
//   gets +X/+0 until end of turn.
//
// Traitorous Instinct's shape with +X/+0.

export default defineCard({
  name: "Unwilling Recruit",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gets +X/+0 and gains haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
