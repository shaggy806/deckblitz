import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 20521. Glint-Nest Crane's shape, three cards.
const ENTER =
  "When this creature enters, look at the top three cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Faerie Mechanist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Faerie", "Artificer"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
