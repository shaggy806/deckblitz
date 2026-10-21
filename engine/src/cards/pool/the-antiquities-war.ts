import { defineCard } from "../define.js";

// EDHREC rank 11985.

const LOOK_TEXT =
  "I, II — Look at the top five cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const ANIMATE_TEXT =
  "III — Artifacts you control become artifact creatures with base power and toughness 5/5 until end of turn.";

export default defineCard({
  name: "The Antiquities War",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${LOOK_TEXT}\n${ANIMATE_TEXT}`,
  chapters: [
    {
      at: [1, 2],
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
      text: LOOK_TEXT,
    },
    {
      // The artifacts are fixed as it resolves (the ruling: ones you control
      // later in the turn aren't animated).
      at: [3],
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "artifact", controlledBy: "you" },
        power: 5,
        toughness: 5,
        addTypes: ["creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
