import { defineCard } from "../define.js";

// EDHREC rank 4151.
//
// "As many times as you choose, you may exile the top card": a `may`, then a
// `repeat` asking after each card (you see each one before deciding — the
// first ruling). The total is read over every pass once the repeat is done
// (an `amounts` condition on the `thisWay` sum), and the casting happens as
// it resolves, timing ignored (the fourth ruling); what isn't cast, lands
// included, stays in exile.
const TEXT =
  "Shuffle your library. As many times as you choose, you may exile the top card of your library. If the total mana value of the cards exiled this way is 13 or less, you may cast any number of spells from among those cards without paying their mana costs.";

export default defineCard({
  name: "Dance with Calamity",
  manaCost: "{7}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-library" },
      {
        kind: "may",
        prompt: "Exile the top card of your library?",
        effect: { kind: "repeat", mayAgain: true, effect: { kind: "exile-from-library", amount: 1 } },
      },
      {
        kind: "conditional",
        condition: { kind: "amounts", left: { thisWay: "exiled", sumOf: "mana-value" }, op: "lte", right: 13 },
        then: { kind: "cast-now", from: "exiled-this-way", repeat: true, free: true },
      },
    ],
  },
});
