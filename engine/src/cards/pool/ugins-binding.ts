import { defineCard } from "../define.js";

const BOUNCE_ALL = "When you do, return each nonland permanent you don't control to its owner's hand.";
const GRAVEYARD_TEXT = `Whenever you cast a colorless spell with mana value 7 or greater, you may exile this card from your graveyard. ${BOUNCE_ALL}`;

export default defineCard({
  name: "Ugin's Binding",
  manaCost: "{2}{U}",
  colors: [],
  types: ["instant"],
  text: `Devoid (This card has no color.)\nReturn target nonland permanent you don't control to its owner's hand.\n${GRAVEYARD_TEXT}`,
  targets: ["nonland-permanent-an-opponent-controls"],
  effect: { kind: "return-to-hand", target: 0 },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { colorless: true, manaValue: { op: "gte", n: 7 } } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Ugin's Binding from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "reflexive-trigger",
                targets: [],
                effect: { kind: "return-to-hand-all", filter: { notTypes: ["land"], controlledBy: "opponent" } },
                text: BOUNCE_ALL,
              },
            },
          ],
        },
      },
      resolve: null,
      text: GRAVEYARD_TEXT,
    },
  ],
});
