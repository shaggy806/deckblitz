import { defineCard } from "../define.js";

/** The back face of Sidequest: Catch a Fish — a land with no color indicator. */

const MANA_TEXT = "{T}: Add {W}.";
const COUNTERS_TEXT =
  "{3}, {T}, Sacrifice an artifact: Put a +1/+1 counter on each creature you control. Activate only as a sorcery.";

export default defineCard({
  name: "Cooking Campsite",
  // A back face has no Scryfall card of its own name — point at its art.
  art: "https://cards.scryfall.io/art_crop/back/b/d/bdb5452e-d97f-409b-91d0-2664f39b09b8.jpg",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${COUNTERS_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: COUNTERS_TEXT,
      sorcerySpeed: true,
    },
  ],
  faces: ["Sidequest: Catch a Fish", "Cooking Campsite"],
  transform: true,
});
