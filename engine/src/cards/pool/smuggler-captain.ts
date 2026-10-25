import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32131.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// No name was noted, so the search can find nothing — but it's still a search, and the
// library is still shuffled (rule 701.23).
export default defineCard({
  name: "Smuggler Captain",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: "Draft this card face up.\nAs you draft a card, you may reveal it, note its name, then turn this card face down.\nWhen this creature enters, you may search your library for a card with a name you noted for cards named Smuggler Captain, reveal it, put it into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library?",
        effect: { kind: "search-library", filter: {}, destination: "hand", reveal: true, min: 0, max: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a card with a name you noted for cards named Smuggler Captain, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
