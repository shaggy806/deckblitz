import { defineCard } from "../define.js";

// EDHREC rank 25243.

const TEXT =
  "{3}{G}, {T}: Reveal the top card of your library. If it's a creature card, put it onto the battlefield. Otherwise, put it into your graveyard.";

export default defineCard({
  name: "Zoologist",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
