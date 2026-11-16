import { defineCard } from "../define.js";

// EDHREC rank 11175. "Each other planeswalker you control has the loyalty
// abilities of Kasmina" is a `grantsActivatedOf` over this permanent itself
// (`zone: "source"`, `only: "loyalty"`): all the loyalty abilities it has,
// granted ones included. On another planeswalker each works from that one
// (rule 201.5b): its loyalty pays, its one loyalty ability a turn is spent
// (606.3), and the −8's "shares a color with this planeswalker" is its colors
// (the ruling) — a colorless one shares a color with nothing. The −X is
// `loyaltyCost: "-x"`.

const STATIC_TEXT = "Each other planeswalker you control has the loyalty abilities of Kasmina.";
const PLUS_TEXT = "+2: Scry 1.";
const MINUS_X_TEXT = "−X: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.";
const ULT_TEXT =
  "−8: Search your library for an instant or sorcery card that shares a color with this planeswalker, exile that card, then shuffle. You may cast that card without paying its mana cost.";

export default defineCard({
  name: "Kasmina, Enigma Sage",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kasmina"],
  loyalty: 2,
  text: `${STATIC_TEXT}\n${PLUS_TEXT}\n${MINUS_X_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Fractal Token", count: 1, thenCounters: { kind: "+1/+1", amount: "x" } },
      resolve: null,
      text: MINUS_X_TEXT,
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
            filter: { typesAnyOf: ["instant", "sorcery"], sharesColorWith: "source" },
            destination: "exile",
            min: 0,
            max: 1,
          },
          { kind: "cast-now", from: "exiled-this-way", free: true },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" }, excludeSelf: true },
      grantsActivatedOf: { zone: "source", filter: {}, only: "loyalty" },
      text: STATIC_TEXT,
    },
  ],
});
