import { defineCard } from "../define.js";

const ETB =
  "When this creature enters, reveal the top three cards of your library. Put all Island cards revealed this way into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Merfolk Wayfinder",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: true,
        min: 3,
        max: 3,
        filter: { subtype: "Island" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ETB,
    },
  ],
});
