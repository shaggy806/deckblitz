import { defineCard } from "../define.js";

export default defineCard({
  name: "Sanctuary Raptor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, if you control three or more tokens, this creature gets +2/+0 and gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { token: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, if you control three or more tokens, this creature gets +2/+0 and gains first strike until end of turn.",
    },
  ],
});
