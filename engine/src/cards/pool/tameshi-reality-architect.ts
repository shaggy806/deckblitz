import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 10264.
//
// Rulings:
//   [2022-02-18] Tameshi's first ability triggers only whenever one or more noncreature
//     permanents are returned to hand from the battlefield. Noncreature permanent cards returned
//     to hand from other zones do not cause this ability to trigger.
//
// "Returned to hand" is a permanent leaving the battlefield for a hand (the ruling), anyone's.
// Once each turn is marked as it triggers, so a batch of several fires it once.

const DRAW_TEXT =
  "Whenever one or more noncreature permanents are returned to hand, draw a card. This ability triggers only once each turn.";
const RETURN_TEXT =
  "{X}{W}, Return a land you control to its owner's hand: Return target artifact or enchantment card with mana value X or less from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Tameshi, Reality Architect",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${DRAW_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "any",
        filter: { notTypes: ["creature"] },
        to: ["hand"],
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      oncePerTurn: true,
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{W}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "enchantment"], manaValue: { op: "lte", n: "x" } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      sorcerySpeed: true,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
