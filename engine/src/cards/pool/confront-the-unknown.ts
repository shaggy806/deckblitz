import { defineCard } from "../define.js";

export default defineCard({
  name: "Confront the Unknown",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Investigate, then target creature gets +1/+1 until end of turn for each Clue you control. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Clue Token", count: 1 },
      {
        kind: "modify-pt",
        target: 0,
        power: { countOf: { subtype: "Clue", controlledBy: "you" } },
        toughness: { countOf: { subtype: "Clue", controlledBy: "you" } },
        duration: "end-of-turn",
      },
    ],
  },
});
