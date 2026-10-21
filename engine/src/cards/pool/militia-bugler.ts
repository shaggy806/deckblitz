import { defineCard } from "../define.js";

// EDHREC rank 14801.

const ETB_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a creature card with power 2 or less from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Militia Bugler",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
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
      text: ETB_TEXT,
    },
  ],
});
