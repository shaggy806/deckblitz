import { defineCard } from "../define.js";

// EDHREC rank 12825.
//
// The replacement is Laboratory Maniac's shape with an effect instead:
// checked draw by draw, so a "draw five" from a library of two draws two and
// then puts counters on Ormos three times (its ruling). The cost's three
// cards are chosen with the `discard` decision, which refuses two of a name.
const REPLACE = "If you would draw a card while your library has no cards in it, instead put five +1/+1 counters on Ormos.";
const DRAW = "{1}{U}{U}, Discard three cards with different names: Draw five cards.";

export default defineCard({
  name: "Ormos, Archive Keeper",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${REPLACE}\n${DRAW}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        whileLibraryEmpty: true,
        instead: { effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 5 } },
      },
      text: REPLACE,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}{U}", tap: false, discard: { count: 3, differentNames: true } },
      targets: [],
      effect: { kind: "draw", amount: 5 },
      resolve: null,
      text: DRAW,
    },
  ],
});
