import { defineCard } from "../define.js";

// The intervening-if (rule 603.4) is checked as each trigger fires and again
// as it resolves — the ruling's "if you have a card in hand as the ability
// resolves, it has no effect".
const TEXT =
  "Whenever this creature enters or attacks, if you have no cards in hand, this creature deals 2 damage to any target.";
const EMPTY_HAND = { kind: "hand-size", atMost: 0 } as const;
const DAMAGE = { kind: "damage", amount: 2, target: 0 } as const;

export default defineCard({
  name: "Bloodhall Priest",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 4,
  toughness: 4,
  madness: { cost: "{1}{B}{R}" },
  text: `${TEXT}\nMadness {1}{B}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: EMPTY_HAND,
      targets: ["any-target"],
      effect: DAMAGE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      condition: EMPTY_HAND,
      targets: ["any-target"],
      effect: DAMAGE,
      resolve: null,
      text: TEXT,
    },
  ],
});
