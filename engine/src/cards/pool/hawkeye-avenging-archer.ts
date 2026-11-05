import { defineCard } from "../define.js";

const DRAW = "Whenever a creature an opponent controls dies, if Hawkeye dealt damage to it this turn, draw a card.";
const PING = "{T}: Hawkeye deals 1 damage to any target.";

// The intervening-if can't turn false once the creature has died: damage dealt
// this turn stays dealt, so the trigger's filter says it all.
export default defineCard({
  name: "Hawkeye, Avenging Archer",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${DRAW}\n${PING}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", controlledBy: "opponent", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING,
    },
  ],
});
