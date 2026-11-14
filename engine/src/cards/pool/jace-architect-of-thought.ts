import { defineCard } from "../define.js";

// EDHREC rank 7372.
//
// The +1 is a delayed trigger until your next turn, whoever the creature
// attacks (the ruling). The −2's opponent is picked as it resolves, not
// targeted; either pile may be empty, and you choose which goes where. The −8
// looks through every library before any choice is final (the ruling: one
// search of them all, up to one nonland card from each), exiles the finds,
// each player shuffles, and only then are they cast, one at a time, free — X
// is 0, and a card that can't be cast or isn't stays exiled.
const WATCH = "Until your next turn, whenever a creature an opponent controls attacks, it gets -1/-0 until end of turn.";
const PLUS = `+1: ${WATCH}`;
const MINUS =
  "−2: Reveal the top three cards of your library. An opponent separates those cards into two piles. Put one pile into your hand and the other on the bottom of your library in any order.";
const ULT =
  "−8: For each player, search that player's library for a nonland card and exile it, then that player shuffles. You may cast those cards without paying their mana costs.";

export default defineCard({
  name: "Jace, Architect of Thought",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "attacks", who: "opponent" },
          until: "until-your-next-turn",
        },
        effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: 0, duration: "end-of-turn" },
        text: WATCH,
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "separate-into-piles",
        objects: { libraryTop: 3, reveal: true },
        separator: "an-opponent",
        chooser: "you",
        chosen: "hand",
        rest: "library-bottom",
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            eachLibrary: "each-player",
            filter: { notTypes: ["land"] },
            destination: "exile",
            min: 0,
            max: 1,
          },
          { kind: "cast-now", from: "exiled-this-way", free: true, repeat: true },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
