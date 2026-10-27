import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 26507.

const TEXT = "Whenever this creature deals combat damage to a player, that player discards a card.";

export default defineCard({
  name: "Headhunter",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{B}" },
  text: `${TEXT}\nMorph {B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
