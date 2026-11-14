import { defineCard } from "../define.js";

// EDHREC rank 9496.
//
// Rulings:
//   If you control a Background that grants an ability to commander creatures you own, and you
//   own more than one commander creature, each of them will have that ability.
//
// The commander has the quoted replacement (`grantsStatic`), working from it (rule 113.10): "you"
// is the commander's controller. The first draw each turn becomes the effect (`would-draw`
// `instead: { effect }`, `firstEachTurn`, rule 614.11); the draw it makes is the turn's second,
// so neither this nor a second commander's copy of it applies to that one.

const DRAW_TEXT =
  "The first time you would draw a card each turn, instead look at the top two cards of your library. Put one of them into your graveyard and the other back on top of your library. Then draw a card.";
const TEXT = `Commander creatures you own have "${DRAW_TEXT}"`;

export default defineCard({
  name: "Scion of Halaster",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsStatic: [
        {
          affects: { scope: "self" },
          replacement: {
            event: "would-draw",
            who: "you",
            firstEachTurn: true,
            instead: {
              effect: {
                kind: "sequence",
                effects: [
                  {
                    kind: "look-and-choose",
                    zone: "library",
                    count: 2,
                    min: 1,
                    max: 1,
                    destination: "graveyard",
                    leftover: "stay",
                  },
                  { kind: "draw", amount: 1 },
                ],
              },
            },
          },
          text: DRAW_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
