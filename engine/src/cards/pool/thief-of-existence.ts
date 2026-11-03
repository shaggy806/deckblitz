import { defineCard } from "../define.js";

// "Gains" on the spell itself, while it's on the stack: the permanent it
// becomes keeps it (rule 400.7a), and a spell countered in response has
// nothing to keep.

const LEAVES_TEXT = "When this creature leaves the battlefield, target opponent draws a card.";
const CAST_TEXT = `When you cast this spell, exile up to one target noncreature, nonland permanent an opponent controls with mana value 4 or less. If you do, Thief of Existence gains "${LEAVES_TEXT}"`;
const DEVOID = "Devoid (This card has no color.)";

export default defineCard({
  name: "Thief of Existence",
  manaCost: "{1}{C}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 3,
  toughness: 4,
  text: `${DEVOID}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        {
          kind: "any-number",
          of: {
            kind: "permanent",
            filter: { notTypes: ["creature", "land"], controlledBy: "opponent", manaValue: { op: "lte", n: 4 } },
          },
          max: 1,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "grant-triggered",
              target: "source",
              duration: "permanent",
              ability: {
                trigger: { on: "leaves-battlefield", who: "self" },
                targets: ["opponent"],
                effect: { kind: "draw", amount: 1, target: 0 },
                resolve: null,
                text: LEAVES_TEXT,
              },
            },
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
