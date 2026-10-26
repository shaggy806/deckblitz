import { defineCard } from "../define.js";

// EDHREC rank 15425. "This creature or enchanted creature" is one ability on
// two triggers (Spiteful Returned's shape): only one can apply at a time,
// since a bestowed Aura isn't a creature and an unattached one enchants
// nothing.
const DRAW_TEXT = "Whenever this creature or enchanted creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Thassa's Emissary",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Crab"],
  power: 3,
  toughness: 3,
  bestow: "{5}{U}",
  text: `Bestow {5}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${DRAW_TEXT}\nEnchanted creature gets +3/+3.`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
});
