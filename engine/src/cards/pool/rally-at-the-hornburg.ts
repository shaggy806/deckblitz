import { defineCard } from "../define.js";

// EDHREC rank 8146.
// Makes Human Soldier → use "Human Soldier Token".
//
// "Humans you control gain haste" is the set of Humans as it resolves (rule
// 611.2c), the two tokens it just made among them.

export default defineCard({
  name: "Rally at the Hornburg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create two 1/1 white Human Soldier creature tokens. Humans you control gain haste until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Human Soldier Token", count: 2 },
      {
        kind: "grant-keyword-all",
        filter: { subtype: "Human", controlledBy: "you" },
        keyword: "haste",
        duration: "end-of-turn",
      },
    ],
  },
});
