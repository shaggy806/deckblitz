import { defineCard } from "../define.js";

// "That creature's controller" is the blocked attacker's (`trigger-controller`
// of `object: "blocked"`); the damage is its power as the trigger resolves.
const T0 = "Whenever this creature blocks a creature, this creature deals damage to that creature's controller equal to this creature's power.";

export default defineCard({
  name: "Meglonoth",
  manaCost: "{3}{R}{G}{W}",
  colors: ["R", "G", "W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${T0}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "damage", amount: { powerOf: "source" }, who: "trigger-controller" },
      resolve: null,
      text: T0,
    },
  ],
});
