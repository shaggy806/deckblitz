import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 27399.

const TEXT = "Whenever this creature blocks, it gets +1/+0 and gains first strike until end of turn.";

export default defineCard({
  name: "Root Spider",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
