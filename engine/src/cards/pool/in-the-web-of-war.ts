import { defineCard } from "../define.js";

const TEXT = "Whenever a creature you control enters, it gets +2/+0 and gains haste until end of turn.";

export default defineCard({
  name: "In the Web of War",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
