import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 27582.
//
// Stinkweed Imp's trigger: combat damage only, once per creature dealt it,
// destroying "that creature" untargeted.

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a creature, destroy that creature.";

export default defineCard({
  name: "Voracious Cobra",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
