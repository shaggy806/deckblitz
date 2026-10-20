import { defineCard } from "../define.js";

// EDHREC rank 25617.

const EXILE_TEXT =
  "When this artifact enters, exile target nonland permanent an opponent controls with mana value 3 or less until this artifact leaves the battlefield.";
const DRAW_TEXT = "{1}, {T}, Discard a legendary card: Draw a card.";

export default defineCard({
  name: "Solitary Cell",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { notTypes: ["land"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1, filter: { supertype: "legendary" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
