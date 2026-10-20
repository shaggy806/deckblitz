import { defineCard } from "../define.js";

// Kaldheim (KHM). A snow *permanent* card (not a snow instant or sorcery), any
// legendary card, or any Saga card. The life is one for each mana from a snow
// source spent to cast it (rule 107.4h) — none for a copy.
const TEXT =
  "Search your library for a snow permanent card, a legendary card, or a Saga card, reveal it, put it into your hand, then shuffle. You gain 1 life for each {S} spent to cast this spell.";

export default defineCard({
  name: "Search for Glory",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["sorcery"],
  text: `${TEXT} ({S} is mana from a snow source.)`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: {
          anyOf: [
            { supertype: "snow", notTypes: ["instant", "sorcery"] },
            { supertype: "legendary" },
            { subtype: "Saga" },
          ],
        },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 1,
      },
      { kind: "gain-life", amount: { manaSpentOf: "source", from: { supertype: "snow" } } },
    ],
  },
});
