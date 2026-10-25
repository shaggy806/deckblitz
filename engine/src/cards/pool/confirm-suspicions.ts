import { defineCard } from "../define.js";

// Its ruling: with its target gone, the spell doesn't resolve and nothing is
// investigated — the engine's fizzle (rule 608.2b).
export default defineCard({
  name: "Confirm Suspicions",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell.\nInvestigate three times. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "create-token", token: "Clue Token", count: 3 },
    ],
  },
});
