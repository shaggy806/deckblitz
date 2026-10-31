import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 1764. The +1 may target none (its ruling). "−X" (rule 107.3a):
// `loyaltyCost: "-x"`, the search's mana value read against that X as it
// resolves.

export default defineCard({
  name: "Tezzeret the Seeker",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tezzeret"],
  loyalty: 4,
  text: "+1: Untap up to two target artifacts.\n−X: Search your library for an artifact card with mana value X or less, put it onto the battlefield, then shuffle.\n−5: Artifacts you control become artifact creatures with base power and toughness 5/5 until end of turn.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: distinctTargets(2, "artifact", { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: "+1: Untap up to two target artifacts.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "artifact", manaValue: { op: "lte", n: "x" } },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: "−X: Search your library for an artifact card with mana value X or less, put it onto the battlefield, then shuffle.",
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "artifact", controlledBy: "you" },
        power: 5,
        toughness: 5,
        addTypes: ["creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "−5: Artifacts you control become artifact creatures with base power and toughness 5/5 until end of turn.",
    },
  ],
});
