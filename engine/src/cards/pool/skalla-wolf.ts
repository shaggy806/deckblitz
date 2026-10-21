import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, look at the top five cards of your library. You may reveal a green card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Skalla Wolf",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Spirit"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { colors: ["G"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
