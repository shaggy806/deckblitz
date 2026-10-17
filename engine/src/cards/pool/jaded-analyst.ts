import { defineCard } from "../define.js";

const TEXT =
  "Whenever you draw your second card each turn, this creature loses defender and gains vigilance until end of turn.";

export default defineCard({
  name: "Jaded Analyst",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 3,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
