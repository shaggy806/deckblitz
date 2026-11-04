import { defineCard } from "../define.js";

// Rulings:
//   Replacement effects can't replace draws Narset disallows; if an opponent's first draw is
//   replaced, that draw didn't happen and Narset won't stop the next draw.
//   An opponent told to draw several when they've drawn none draws one. Optional draws can't be
//   chosen, even if one could be drawn.
//   Narset sees cards drawn earlier in the turn she entered, without affecting them.
const LIMIT_TEXT = "Each opponent can't draw more than one card each turn.";
const MINUS_TEXT =
  "−2: Look at the top four cards of your library. You may reveal a noncreature, nonland card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Narset, Parter of Veils",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["planeswalker"],
  supertypes: ["legendary"],
  subtypes: ["Narset"],
  loyalty: 5,
  text: `${LIMIT_TEXT}\n${MINUS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "opponents", drawsPerTurn: 1 },
      text: LIMIT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false },
      loyaltyCost: -2,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { notTypes: ["creature", "land"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
