import { defineCard } from "../define.js";

export default defineCard({
  name: "Violent Outburst",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nCreatures you control get +1/+0 until end of turn.",
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
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
