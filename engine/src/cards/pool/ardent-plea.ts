import { defineCard } from "../define.js";

export default defineCard({
  name: "Ardent Plea",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Exalted",
    },
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
