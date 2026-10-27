import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, that player exiles the top ten cards of their library.";

export default defineCard({
  name: "Raven Guild Master",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Mutant"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{U}{U}" },
  text: `${DAMAGE_TEXT}\nMorph {2}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 10 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
