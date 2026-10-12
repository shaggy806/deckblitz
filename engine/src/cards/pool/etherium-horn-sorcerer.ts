import { defineCard } from "../define.js";

export default defineCard({
  name: "Etherium-Horn Sorcerer",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Minotaur", "Wizard", "Sorcerer"],
  power: 3,
  toughness: 6,
  text: "{1}{U}{R}: Return this creature to its owner's hand.\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
  activated: [
    {
      cost: { mana: "{1}{U}{R}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{1}{U}{R}: Return this creature to its owner's hand.",
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
