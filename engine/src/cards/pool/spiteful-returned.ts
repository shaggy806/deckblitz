import { defineCard } from "../define.js";

// EDHREC rank 22543. "This creature or enchanted creature attacks" is one
// ability on two triggers (Chainflail Centipede's shape): only one can apply
// at a time, since a bestowed Aura isn't a creature and an unattached one
// enchants nothing. The defending player is the trigger player.
const ATTACK_TEXT = "Whenever this creature or enchanted creature attacks, defending player loses 2 life.";

export default defineCard({
  name: "Spiteful Returned",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  bestow: "{3}{B}",
  text: `Bestow {3}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${ATTACK_TEXT}\nEnchanted creature gets +1/+1.`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: 2 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "attacks", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: 2 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});
