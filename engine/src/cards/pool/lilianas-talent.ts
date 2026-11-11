import { defineCard } from "../define.js";

// EDHREC rank 7251. Any damage a creature deals to the enchanted planeswalker,
// combat or not (the ruling); the granted [−8] is one more loyalty ability of
// it, one a turn among them all (the other ruling).
const GRANTED = "−8: Put all creature cards from all graveyards onto the battlefield under your control.";
const DAMAGE_TEXT = "Whenever a creature deals damage to enchanted planeswalker, destroy that creature.";

export default defineCard({
  name: "Liliana's Talent",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant planeswalker\nEnchanted planeswalker has "[−8]: Put all creature cards from all graveyards onto the battlefield under your control."\n${DAMAGE_TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, toFilter: { hostOfSource: true } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          loyaltyCost: -8,
          cost: { tap: false, mana: null },
          targets: [],
          effect: {
            kind: "return-from-graveyard",
            from: "all-graveyards",
            filter: { type: "creature" },
            destination: "battlefield",
            count: "all",
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: 'Enchanted planeswalker has "[−8]: Put all creature cards from all graveyards onto the battlefield under your control."',
    },
  ],
});
