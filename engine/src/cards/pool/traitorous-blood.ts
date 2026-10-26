import { defineCard } from "../define.js";

// EDHREC rank 12172. Hijack's shape, with trample beside haste.
//
// Rulings:
//   [2011-09-22] Gaining control of a creature doesn’t cause you gain control of any Auras or
//     Equipment attached to it.
//   [2011-09-22] Traitorous Blood can target any creature, even one that’s tapped or one you
//     already control.

export default defineCard({
  name: "Traitorous Blood",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap it. It gains trample and haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
