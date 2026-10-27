import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 31103. Spark Mage's trigger, for 3.

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, you may have it deal 3 damage to target creature that player controls.";

export default defineCard({
  name: "Snapping Thragg",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  morph: { keyword: "morph", cost: "{4}{R}{R}" },
  text: `${TRIGGER_TEXT}\nMorph {4}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Have this creature deal 3 damage to the targeted creature?",
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
