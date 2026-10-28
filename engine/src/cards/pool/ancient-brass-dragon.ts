import { defineCard } from "../define.js";

// EDHREC rank 1748.
//
// The roll is the reflexive ability's value, and the cap on its group's total
// mana value.

const TEXT =
  "Whenever this creature deals combat damage to a player, roll a d20. When you do, put any number of target creature cards with total mana value X or less from graveyards onto the battlefield under your control, where X is the result.";

export default defineCard({
  name: "Ancient Brass Dragon",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        then: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "any-number",
              of: { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } },
              maxTotalManaValue: { triggerValue: true },
            },
          ],
          value: { roll: "total" },
          effect: {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          },
          text: "When you do, put any number of target creature cards with total mana value X or less from graveyards onto the battlefield under your control, where X is the result.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
