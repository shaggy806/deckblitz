import { defineCard } from "../define.js";

const TEXT =
  "{2}{W}: Look at the top four cards of your library. You may reveal a creature card with power 2 or less from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Squad Rallier",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
