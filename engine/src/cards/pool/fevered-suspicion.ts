import { defineCard } from "../define.js";

// EDHREC rank 5650. Adventures in the Forgotten Realms Commander.
//
// Each opponent's library in turn order (Consuming Aberration's
// `for-each-player` reveal-until), exiling as it goes, every card staying in
// exile. Then Etali, Primal Storm's free casts from among the cards exiled
// this way, any number, in any order, as this resolves (the rulings) — a
// land card is never offered, and X is 0 (rule 107.3b). Rebound (rule
// 702.88) when cast from the hand.
const TEXT =
  "Each opponent exiles cards from the top of their library until they exile a nonland card. You may cast any number of spells from among those nonland cards without paying their mana costs.";

export default defineCard({
  name: "Fevered Suspicion",
  manaCost: "{6}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  rebound: true,
  text:
    `${TEXT}\n` +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-opponent",
        effect: { kind: "reveal-until", whose: "that-player", filter: { notTypes: ["land"] }, exile: true, rest: "stay" },
      },
      { kind: "cast-now", from: "exiled-this-way", free: true, repeat: true },
    ],
  },
});
