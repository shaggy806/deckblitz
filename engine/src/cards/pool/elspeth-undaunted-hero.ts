import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// −2 is Tower Winder's "library and/or graveyard" shape, onto the
// battlefield; only a search that includes the library shuffles. −8's X is
// read once, as it resolves, and only the creatures you control then get it
// (the rulings).
const PLUS_TEXT = "+2: Put a +1/+1 counter on each of up to two target creatures.";
const MINUS_TEXT =
  "−2: Search your library and/or graveyard for a card named Sunlit Hoplite and put it onto the battlefield. If you search your library this way, shuffle.";
const ULT_TEXT =
  "−8: Until end of turn, creatures you control gain flying and get +X/+X, where X is your devotion to white.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Sunlit Hoplite" },
  destination: "battlefield",
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Elspeth, Undaunted Hero",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Elspeth"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
          { text: "Search your library", effect: search("library") },
          { text: "Search your graveyard", effect: search("graveyard") },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "flying",
            duration: "end-of-turn",
          },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: { devotionTo: "W" },
            toughness: { devotionTo: "W" },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
