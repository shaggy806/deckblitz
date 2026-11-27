import { defineCard } from "../define.js";

// The right half of Rise // Fall (see rise-fall.ts). Two different cards
// picked at random and revealed together (`choose-random-card` `count`,
// Nebuchadnezzar's shape; the one card of a hand of one), then the nonland
// ones among them discarded at once.
const FACES = ["Rise // Fall", "Rise", "Fall"];

export default defineCard({
  name: "Fall",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Target player reveals two cards at random from their hand, then discards each nonland card revealed this way.",
  targets: ["player"],
  effect: {
    kind: "choose-random-card",
    zone: "hand",
    whose: 0,
    show: "reveal",
    count: 2,
    then: {
      kind: "for-each-target",
      from: 0,
      simultaneous: true,
      only: { notTypes: ["land"] },
      effect: { kind: "discard-card", target: 0 },
    },
  },
  faces: FACES,
  split: true,
});
