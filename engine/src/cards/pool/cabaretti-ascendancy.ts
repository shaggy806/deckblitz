import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, look at the top card of your library. If it's a creature or planeswalker card, you may reveal it and put it into your hand. If you don't put the card into your hand, you may put it on the bottom of your library.";

// Bucolic Ranch's look: a creature or planeswalker card may be revealed and
// taken; a card not taken may then go to the bottom, or stay on top.
export default defineCard({
  name: "Cabaretti Ascendancy",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "library-bottom" },
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
