import { defineCard } from "../define.js";

// EDHREC rank 25076.
//
// The five permanents are chosen as it resolves (no targets), five if you
// control that many and all of them if fewer; a token stack named twice is
// two of its tokens. Then one search with a slot for each chosen permanent
// (`together: { oneEachSameNameAs: { targets } }`), each filled by at most
// one card of that permanent's name — five chosen Plains may find five
// Plains. The finds enter tapped together, then the library is shuffled.
// "You may search": declined, there's no search and no shuffle (Doubling
// Chant's shape).

const CHOSEN = { targets: [0, 1, 2, 3, 4] } as const;

export default defineCard({
  name: "Clarion Ultimatum",
  manaCost: "{G}{G}{W}{W}{W}{U}{U}",
  colors: ["G", "W", "U"],
  types: ["sorcery"],
  text: "Choose five permanents you control. For each of those permanents, you may search your library for a card with the same name as that permanent. Put those cards onto the battlefield tapped, then shuffle.",
  targets: [],
  effect: {
    kind: "choose-permanents",
    filter: { controlledBy: "you" },
    min: 5,
    upTo: 5,
    thenTogether: true,
    prompt: "Choose five permanents you control",
    then: {
      kind: "may",
      prompt: "Search your library for cards with the same names as the chosen permanents?",
      effect: {
        kind: "search-library",
        filter: {},
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 5,
        upTo: true,
        together: { oneEachSameNameAs: CHOSEN },
      },
    },
  },
});
