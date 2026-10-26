import { defineCard } from "../define.js";

// Planar Chaos (PLC). Despair's trigger, with morph.
const TEXT = "Whenever this creature deals combat damage to a player, that player discards a card.";

export default defineCard({
  name: "Riptide Pilferer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{U}" },
  text: `${TEXT}\nMorph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
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
