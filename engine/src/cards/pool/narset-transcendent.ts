import { defineCard } from "../define.js";

// EDHREC rank 7851. +1: a creature or land card isn't revealed (its ruling).
// −2: once, the first instant or sorcery cast from your hand this turn.
const PLUS =
  "+1: Look at the top card of your library. If it's a noncreature, nonland card, you may reveal it and put it into your hand.";
const MINUS =
  "−2: When you next cast an instant or sorcery spell from your hand this turn, it gains rebound. (Exile the spell as it resolves. At the beginning of your next upkeep, you may cast that card from exile without paying its mana cost.)";
const EMBLEM = "Your opponents can't cast noncreature spells.";
const ULT = `−9: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Narset Transcendent",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Narset"],
  loyalty: 6,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { notTypes: ["creature", "land"] },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
          once: true,
        },
        effect: { kind: "grant-keyword", target: "trigger-object", keyword: "rebound", duration: "permanent" },
        text: "When you next cast an instant or sorcery spell from your hand this turn, it gains rebound.",
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: {
          affects: { scope: "self" },
          prohibits: { who: "opponents", spells: { notTypes: ["creature"] } },
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
