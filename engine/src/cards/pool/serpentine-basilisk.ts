import { defineCard } from "../define.js";

// EDHREC rank 27435.

export default defineCard({
  name: "Serpentine Basilisk",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Basilisk"],
  power: 2,
  toughness: 3,
  morph: { keyword: "morph", cost: "{1}{G}{G}" },
  text: "Whenever this creature deals combat damage to a creature, destroy that creature at end of combat.\nMorph {1}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: { kind: "destroy", target: "trigger-recipient" },
        text: "Destroy that creature.",
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, destroy that creature at end of combat.",
    },
  ],
});
