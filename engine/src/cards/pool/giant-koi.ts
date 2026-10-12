import { defineCard } from "../define.js";

// EDHREC rank 14905.

export default defineCard({
  name: "Giant Koi",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 5,
  toughness: 7,
  cycling: { cost: "{2}", search: { subtype: "Island" } },
  text: "Waterbend {3}: This creature can't be blocked this turn. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\nIslandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand, then shuffle.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false, waterbend: true },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Waterbend {3}: This creature can't be blocked this turn.",
    },
  ],
});
