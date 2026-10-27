import { defineCard } from "../define.js";

export default defineCard({
  name: "Silent Specter",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{3}{B}{B}" },
  text: "Flying\nWhenever this creature deals combat damage to a player, that player discards two cards.\nMorph {3}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 2 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player discards two cards.",
    },
  ],
});
