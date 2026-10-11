import { defineCard } from "../define.js";

// Rulings: the copy is of the Elemental's copiable values (a token of a
// token copies what made it); with every target illegal it does nothing, with
// some it does what it can. "Target Elemental you control" is any Elemental
// permanent — a kindred one too.

export default defineCard({
  name: "Ashling's Command",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["kindred", "instant"],
  subtypes: ["Elemental"],
  text:
    "Choose two —\n" +
    "• Create a token that's a copy of target Elemental you control.\n" +
    "• Target player draws two cards.\n" +
    "• Ashling's Command deals 2 damage to each creature target player controls.\n" +
    "• Target player creates two Treasure tokens.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Create a token that's a copy of target Elemental you control.",
        targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Elemental" } }],
        effect: { kind: "create-token-copy", of: 0, count: 1 },
      },
      {
        text: "Target player draws two cards.",
        targets: ["player"],
        effect: { kind: "draw", amount: 2, target: 0 },
      },
      {
        text: "Ashling's Command deals 2 damage to each creature target player controls.",
        targets: ["player"],
        effect: { kind: "damage-all", filter: { type: "creature" }, amount: 2, controlledByTarget: 0 },
      },
      {
        text: "Target player creates two Treasure tokens.",
        targets: ["player"],
        effect: { kind: "create-token", token: "Treasure Token", count: 2, who: "target-controller" },
      },
    ],
  },
});
