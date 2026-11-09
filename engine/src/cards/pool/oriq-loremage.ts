import { defineCard } from "../define.js";

// EDHREC rank 5118. "It" is the found card, as `then`'s slot 0 reads it wherever
// it went (Rest in Peace exiling it).

const TEXT =
  "{T}: Search your library for a card, put it into your graveyard, then shuffle. If it's an instant or sorcery card, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Oriq Loremage",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {},
        destination: "graveyard",
        min: 1,
        max: 1,
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { typesAnyOf: ["instant", "sorcery"] } },
          then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
