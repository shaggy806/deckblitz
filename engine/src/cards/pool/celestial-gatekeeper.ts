import { defineCard } from "../define.js";

// Its own card is a legal target as the trigger goes on the stack (in the
// graveyard by then). Targeting it is legal but pointless: "exile it" moves
// it first, so the put no longer finds the same object (rules 400.7, 608.2b;
// the ruling).
const DIES_TEXT =
  "When this creature dies, exile it, then return up to two target Bird and/or Cleric permanent cards from your graveyard to the battlefield.";

export default defineCard({
  name: "Celestial Gatekeeper",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: {
              subtypes: ["Bird", "Cleric"],
              typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
            },
          },
          max: 2,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "put-onto-battlefield", target: 0 } },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
