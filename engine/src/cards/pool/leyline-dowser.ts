import { defineCard } from "../define.js";

// EDHREC rank 19075.
//
// Sparring Dummy's mill-one-and-maybe-keep-it, and Relic of Legends' "tap an
// untapped legendary creature you control" — any one, summoning sick or not
// (the ruling).
const MILL_TEXT = "{1}, {T}: Mill a card. You may put an instant or sorcery card milled this way into your hand.";
const UNTAP_TEXT = "Tap an untapped legendary creature you control: Untap this artifact.";

export default defineCard({
  name: "Leyline Dowser",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${MILL_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", typesAnyOf: ["instant", "sorcery"] },
          },
        ],
      },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: {
          count: 1,
          filter: { supertype: "legendary", type: "creature", controlledBy: "you" },
          includeSelf: true,
        },
      },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
