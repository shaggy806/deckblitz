import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 27972. Trygon Predator's trigger, enchantments only.

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, you may destroy target enchantment that player controls.";

export default defineCard({
  name: "Dawning Purist",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{1}{W}" },
  text: `${TRIGGER_TEXT}\nMorph {1}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "enchantment" } }],
      effect: {
        kind: "may",
        prompt: "Destroy the target enchantment?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
