import { defineCard } from "../define.js";

// EDHREC rank 3401. A villainous choice (rule 701.56), each opponent in turn
// order, each choice carried out before the next opponent chooses (the
// ruling). The first option's cast is the caster's, and optional; the
// second option's damage counts only that opponent's exiled cards.

const TEXT =
  "Each opponent faces a villainous choice — They exile cards from the top of their library until they exile a nonland card, then you may cast that card without paying its mana cost, or that player exiles the top four cards of their library and Ensnared by the Mara deals damage equal to the total mana value of those exiled cards to that player.";

export default defineCard({
  name: "Ensnared by the Mara",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "each-opponent",
    choices: [
      {
        text: "Exile cards from the top of your library until you exile a nonland card; they may cast it without paying its mana cost.",
        effect: {
          kind: "reveal-until",
          whose: "that-player",
          filter: { notTypes: ["land"] },
          exile: true,
          then: { kind: "cast-now", target: 0, free: true },
          rest: "stay",
        },
      },
      {
        text: "Exile the top four cards of your library; this deals damage to you equal to their total mana value.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile-from-library", whose: "that-player", amount: 4 },
            {
              kind: "damage",
              amount: { thisWay: "exiled", who: "that-player", sumOf: "mana-value" },
              who: "that-player",
            },
          ],
        },
      },
    ],
  },
});
