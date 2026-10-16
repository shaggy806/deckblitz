import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// Disguise {3}{G/U}{G/U} (rule 702.168): cast face down for {3} as a 2/2 with
// ward {2}, turned face up for its disguise cost.

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, investigate.";

export default defineCard({
  name: "Undercover Crocodelf",
  manaCost: "{4}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Crocodile", "Detective"],
  power: 5,
  toughness: 5,
  text: "Whenever this creature deals combat damage to a player, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")\nDisguise {3}{G/U}{G/U} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)",
  morph: { keyword: "disguise", cost: "{3}{G/U}{G/U}" },
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
