import { defineCard } from "../define.js";

export default defineCard({
  name: "Hystrodon",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  morph: { keyword: "morph", cost: "{1}{G}{G}" },
  text: "Trample\nWhenever this creature deals combat damage to a player, you may draw a card.\nMorph {1}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may draw a card.",
    },
  ],
});
