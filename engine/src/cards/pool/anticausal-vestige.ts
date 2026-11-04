import { defineCard } from "../define.js";

const LEAVES_TEXT =
  "When this creature leaves the battlefield, draw a card, then you may put a permanent card with mana value less than or equal to the number of lands you control from your hand onto the battlefield tapped.";
const WARP_TEXT =
  "Warp {4} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)";

export default defineCard({
  name: "Anticausal Vestige",
  manaCost: "{6}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 7,
  toughness: 5,
  text: `${LEAVES_TEXT}\n${WARP_TEXT}`,
  warp: { cost: "{4}" },
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            enterTapped: true,
            leftover: "stay",
            filter: {
              typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
              manaValue: { op: "lte", n: { amount: { countOf: { type: "land", controlledBy: "you" } } } },
            },
          },
        ],
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
