import { defineCard } from "../define.js";

export default defineCard({
  name: "The Chase Is On",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +3/+0 and gains first strike until end of turn. Investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      { kind: "create-token", token: "Clue Token", count: 1 },
    ],
  },
});
