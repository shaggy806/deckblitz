import { defineCard } from "../define.js";

// EDHREC rank 9518.

const ATTACK_TEXT =
  "Whenever Ashe attacks, look at the top five cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Ashe, Princess of Dalmasca",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Noble"],
  power: 3,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
