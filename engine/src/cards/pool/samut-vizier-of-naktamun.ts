import { defineCard } from "../define.js";

// EDHREC rank 7100.
//
// "If that creature entered this turn" is an intervening-if (rule 603.4):
// the trigger's filter asks it as the damage is dealt, and the conditional
// asks it again as the ability resolves — of the creature as it last existed
// on the battlefield, if it has left (evolve's shape, helpers.ts).
const DRAW_TEXT =
  "Whenever a creature you control deals combat damage to a player, if that creature entered this turn, draw a card.";

export default defineCard({
  name: "Samut, Vizier of Naktamun",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike", "vigilance", "haste"],
  text: `First strike, vigilance, haste\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", enteredThisTurn: true },
      },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { enteredThisTurn: true } },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
