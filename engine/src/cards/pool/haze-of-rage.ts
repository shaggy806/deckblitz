import { defineCard } from "../define.js";

export default defineCard({
  name: "Haze of Rage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "buyback" },
  text: "Buyback {2} (You may pay an additional {2} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCreatures you control get +1/+0 until end of turn.\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 1,
    toughness: 0,
    duration: "end-of-turn",
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
