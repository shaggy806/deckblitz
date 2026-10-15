import { defineCard } from "../define.js";

// EDHREC rank 14394. Secrets of Strixhaven Commander.
//
// A vote (rule 701.38 — Selvala's Stampede's shape): as it resolves, starting
// with its caster and in turn order, each player votes past or present, each
// knowing the votes before theirs, nobody abstaining (the rulings). The
// damage is the total mana value of the cards this milled, {X} as 0 (the
// ruling); the exiled cards are played by their usual rules (lands as a land
// play) until the end of your next turn.
const TEXT =
  "Council's dilemma — Starting with you, each player votes for past or present. You mill a card for each past vote, then Fateful Tempest deals damage to each opponent equal to the total mana value of cards milled this way. Exile the top card of your library for each present vote. Until the end of your next turn, you may play the exiled cards.";

const NOTHING = { kind: "sequence", effects: [] } as const;

export default defineCard({
  name: "Fateful Tempest",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "each-player-may",
        who: "each-player",
        startingWithYou: true,
        choices: [
          { text: "Vote for past", effect: NOTHING },
          { text: "Vote for present", effect: NOTHING },
        ],
      },
      { kind: "mill", target: "you", amount: { votesFor: 0 } },
      { kind: "damage", amount: { thisWay: "milled", sumOf: "mana-value" }, who: "each-opponent" },
      { kind: "impulse-exile", amount: { votesFor: 1 }, duration: "your-next-turn" },
    ],
  },
});
