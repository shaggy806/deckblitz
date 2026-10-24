import { defineCard } from "../define.js";

const TEXT =
  "{2}{G}, {T}, Put a verse counter on Yisan: Search your library for a creature card with mana value equal to the number of verse counters on Yisan, put it onto the battlefield, then shuffle.";

// The counter is part of the cost, so the count includes it; a Yisan gone
// by resolution is read as it last existed (the ruling — a source read).
export default defineCard({
  name: "Yisan, the Wanderer Bard",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Bard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true, addCounter: { kind: "verse", count: 1 } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          type: "creature",
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "verse" } } },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
