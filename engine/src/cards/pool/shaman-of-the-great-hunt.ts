import { defineCard } from "../define.js";

// Ferocious is only an ability word here (rule 207.2c): the ability has no
// activation condition, it just counts creatures with power 4 or greater.

const FEROCIOUS = "Ferocious — {2}{G/U}{G/U}: Draw a card for each creature you control with power 4 or greater.";

export default defineCard({
  name: "Shaman of the Great Hunt",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\nWhenever a creature you control deals combat damage to a player, put a +1/+1 counter on it.\n${FEROCIOUS}`,
  activated: [
    {
      cost: { mana: "{2}{G/U}{G/U}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } } } },
      resolve: null,
      text: FEROCIOUS,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control deals combat damage to a player, put a +1/+1 counter on it.",
    },
  ],
});
