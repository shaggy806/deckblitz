import { defineCard } from "../define.js";

// Its rulings: cast with no targets, it only investigates; with targets that
// have all become illegal, it doesn't resolve (rule 608.2b).
export default defineCard({
  name: "Expose Evil",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap up to two target creatures.\nInvestigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "create-token", token: "Clue Token", count: 1 },
    ],
  },
});
