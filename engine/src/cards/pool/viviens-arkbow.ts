import { defineCard } from "../define.js";

const TEXT =
  "{X}, {T}, Discard a card: Look at the top X cards of your library. You may put a creature card with mana value X or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Vivien's Arkbow",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        min: 0,
        max: 1,
        filter: { type: "creature", manaValue: { op: "lte", n: { amount: "x" } } },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
