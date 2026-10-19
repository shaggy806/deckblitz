import { defineCard } from "../define.js";

// EDHREC rank 23939.
//
// A permanent spell's kicker rider is an ETB trigger with a `self-kicked`
// intervening-if (Verix Bladewing's shape).

const ETB_TEXT =
  "When this creature enters, if it was kicked, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Vineshaper Prodigy",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: `Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\n${ETB_TEXT}`,
  kicker: { cost: "{1}{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
