import { defineCard } from "../define.js";

// EDHREC rank 14744.
//
// The first ability may be activated with no Nissa's Chosen in the library;
// the library is still searched and shuffled (the ruling).
export default defineCard({
  name: "Nissa Revane",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 2,
  text: "+1: Search your library for a card named Nissa's Chosen, put it onto the battlefield, then shuffle.\n+1: You gain 2 life for each Elf you control.\n−7: Search your library for any number of Elf creature cards, put them onto the battlefield, then shuffle.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Nissa's Chosen" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: "+1: Search your library for a card named Nissa's Chosen, put it onto the battlefield, then shuffle.",
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { countOf: { subtype: "Elf", controlledBy: "you" }, times: 2 },
      },
      resolve: null,
      text: "+1: You gain 2 life for each Elf you control.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature", subtype: "Elf" },
        destination: "battlefield",
        min: 0,
        max: { librarySize: "you" },
      },
      resolve: null,
      text: "−7: Search your library for any number of Elf creature cards, put them onto the battlefield, then shuffle.",
    },
  ],
});
