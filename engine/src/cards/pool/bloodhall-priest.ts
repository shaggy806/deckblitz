import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature enters or attacks, if you have no cards in hand, this creature deals 2 damage to any target.";

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
      condition: { kind: "hand-size", atMost: 0 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      condition: { kind: "hand-size", atMost: 0 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
