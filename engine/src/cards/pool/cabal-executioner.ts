import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 26307.

const HIT = "Whenever this creature deals combat damage to a player, that player sacrifices a creature of their choice.";

export default defineCard({
  name: "Cabal Executioner",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{3}{B}{B}" },
  text: `${HIT}\nMorph {3}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: HIT,
    },
  ],
});
