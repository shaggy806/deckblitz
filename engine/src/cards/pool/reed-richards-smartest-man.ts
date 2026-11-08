import { defineCard } from "../define.js";

// EDHREC rank 13239.
//
// "The first time you would draw a card each turn except the first card you draw during each of
// your draw steps": a `would-draw` "draw four instead" with `firstEachTurn` and
// `exceptFirstInDrawStep` — the turn's first draw event that isn't your draw step's first card,
// read from the turn's history, so the four it draws aren't replaced by it again (rule 614.5).

const HAND_TEXT = "You have no maximum hand size.";
const DRAW_TEXT =
  "The first time you would draw a card each turn except the first card you draw during each of your draw steps, you draw four cards instead.";

export default defineCard({
  name: "Reed Richards, Smartest Man",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${HAND_TEXT}\n${DRAW_TEXT}`,
  static: [
    { affects: { scope: "self" }, noMaxHandSize: true, text: HAND_TEXT },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: { modify: { set: 4 } },
        exceptFirstInDrawStep: true,
        firstEachTurn: true,
      },
      text: DRAW_TEXT,
    },
  ],
});
