import { defineCard } from "../define.js";

// EDHREC rank 21303. Devoid: no colors. Decision Paralysis plus a Scion; cast
// with no targets it still makes the Scion (the ruling).

export default defineCard({
  name: "Adverse Conditions",
  manaCost: "{3}{U}",
  colors: [],
  types: ["instant"],
  text: 'Devoid (This card has no color.)\nTap up to two target creatures. Those creatures don\'t untap during their controller\'s next untap step. Create a 1/1 colorless Eldrazi Scion creature token. It has "Sacrifice this token: Add {C}."',
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "tap", target: 1, doesntUntapNext: true },
      { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
    ],
  },
});
