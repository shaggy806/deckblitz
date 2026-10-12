import { defineCard } from "../define.js";

export default defineCard({
  name: "Survive the Night",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+0 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)\nInvestigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "indestructible",
            duration: "end-of-turn",
          },
        ],
      },
      { kind: "create-token", token: "Clue Token", count: 1 },
    ],
  },
});
