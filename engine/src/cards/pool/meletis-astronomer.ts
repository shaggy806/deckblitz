import { defineCard } from "../define.js";

// EDHREC rank 25118.
const HEROIC =
  "Heroic — Whenever you cast a spell that targets this creature, look at the top three cards of your library. You may reveal an enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Meletis Astronomer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: HEROIC,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "enchantment" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: HEROIC,
    },
  ],
});
