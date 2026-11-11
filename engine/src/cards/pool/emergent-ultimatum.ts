import { defineCard } from "../define.js";

// The finds are exiled first, and stay exiled unless cast: the search itself
// doesn't shuffle (`shufflesLater`); the one shuffle is "shuffle that card
// into your library", owed even with nothing found (rule 701.24d). The
// opponent is the caster's choice once the cards are in exile, and chooses
// among those cards — the only one, with one. The others may be cast only as
// this resolves, timing ignored, X as 0 (the rulings); monocolored is exactly
// one colour (the ruling).

const TEXT =
  "Search your library for up to three monocolored cards with different names and exile them. An opponent chooses one of those cards. Shuffle that card into your library. You may cast the other cards without paying their mana costs. Exile Emergent Ultimatum.";

export default defineCard({
  name: "Emergent Ultimatum",
  manaCost: "{B}{B}{G}{G}{G}{U}{U}",
  colors: ["B", "G", "U"],
  types: ["sorcery"],
  text: TEXT,
  exileOnResolve: true,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { multicolored: false, colorless: false },
        destination: "exile",
        min: 0,
        max: 3,
        together: { distinctNames: true },
        shufflesLater: true,
      },
      {
        kind: "look-and-choose",
        zone: "exiled-this-way",
        chooser: "an-opponent",
        min: 1,
        max: 1,
        destination: "library-top",
        leftover: "stay",
        prompt: "Choose a card to shuffle into its owner's library",
      },
      { kind: "shuffle-library", searchers: true },
      { kind: "cast-now", from: "exiled-this-way", repeat: true, free: true },
    ],
  },
});
