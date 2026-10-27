import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const I_TEXT =
  "I — Until your next turn, whenever a creature attacks you or a planeswalker you control, it gets -2/-0 until end of turn.";
const II_TEXT = "II — Discard any number of cards, then investigate twice for each card discarded this way.";
const III_TEXT = "III — Shuffle up to three target cards from your graveyard into your library.";

export default defineCard({
  name: "Tamiyo Meets the Story Circle",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "attacks", who: "any", filter: { type: "creature" }, attackingYou: true },
          until: "your-next-turn",
        },
        effect: { kind: "modify-pt", target: "trigger-object", power: -2, toughness: 0, duration: "end-of-turn" },
        text: "Until your next turn, whenever a creature attacks you or a planeswalker you control, it gets -2/-0 until end of turn.",
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true },
          investigate({ product: [2, { thisWay: "discarded", who: "you" }] }),
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 3 }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "put-on-library", target: 0, position: "top" },
          },
          { kind: "shuffle-library" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
