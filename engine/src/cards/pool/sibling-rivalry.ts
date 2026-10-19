import { defineCard } from "../define.js";

// EDHREC rank 18673. The Brothers' War.
// Rulings:
//   Although all the cards in The Brothers' War that create Powerstone tokens create a tapped
//   Powerstone token, entering the battlefield tapped isn't part of the token's definition.

export default defineCard({
  name: "Sibling Rivalry",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target artifact or creature until end of turn. Untap it. It gains haste until end of turn. Create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  targets: ["artifact-or-creature"],
  // Involuntary Employment's shape.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
    ],
  },
});
