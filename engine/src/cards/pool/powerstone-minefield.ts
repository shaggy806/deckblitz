import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 19483.
//
// One ability with two events (Caltrops' attack half, Heat of Battle's block half): each
// attacker or blocker is the trigger object, dealt the damage.
const TEXT = "Whenever a creature attacks or blocks, this enchantment deals 2 damage to it.";

export default defineCard({
  name: "Powerstone Minefield",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 2, target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "any", filter: { type: "creature" } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "damage", amount: 2, target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
