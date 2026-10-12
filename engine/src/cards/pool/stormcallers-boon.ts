import { defineCard } from "../define.js";

export default defineCard({
  name: "Stormcaller's Boon",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: "Sacrifice this enchantment: Creatures you control gain flying until end of turn.\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "flying",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice this enchantment: Creatures you control gain flying until end of turn.",
    },
  ],
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
