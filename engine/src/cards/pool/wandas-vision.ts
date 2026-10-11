import { defineCard } from "../define.js";

// EDHREC rank 15129. Marvel Super Heroes Commander.
//
// Kraum's "second spell each turn" (`nthEachTurn: 2`) and Nico Minoru,
// Runaway's reveal-until: every card exiled this way stays in exile
// (`rest: "stay"`), the nonland card included unless it's cast.
const TEXT =
  "Whenever you cast your second spell each turn, exile cards from the top of your library until you exile a nonland card. You may cast that card without paying its mana cost.";

export default defineCard({
  name: "Wanda's Vision",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
