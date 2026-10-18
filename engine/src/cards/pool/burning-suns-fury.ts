import { defineCard } from "../define.js";

// EDHREC rank 20743.
//
// Second Breakfast's two optional slots, each getting the pump and haste.

export default defineCard({
  name: "Burning Sun's Fury",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nUp to two target creatures each get +2/+0 and gain haste until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
