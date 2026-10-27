import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 29309. Goblin Ringleader's shape: `min` = `max` = 4 is clamped
// to the Kavu among the four, so every one of them is taken.
const TEXT =
  "When this creature enters, reveal the top four cards of your library. Put all Kavu cards revealed this way into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Kavu Howler",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { subtype: "Kavu" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
