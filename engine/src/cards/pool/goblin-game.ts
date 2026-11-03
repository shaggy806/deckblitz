import { defineCard } from "../define.js";

// Hiding items is a secret number, one or more, with the same rules as any other
// simultaneous reveal: nobody sees a count until they're all in. A tie for fewest
// is every tied player.

export default defineCard({
  name: "Goblin Game",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player hides at least one item, then all players reveal them simultaneously. Each player loses life equal to the number of items they revealed. The player who revealed the fewest items then loses half their life, rounded up. If two or more players are tied for fewest, each loses half their life, rounded up.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, secret: true, for: { number: { min: 1 } } },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: { kind: "lose-life", who: "that-player", amount: { votedNumber: "that-player" } },
      },
      {
        kind: "for-each-player",
        who: "each-player",
        whoIf: { kind: "voted-number", who: "that-player", is: "lowest" },
        effect: { kind: "lose-life", who: "that-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      },
    ],
  },
});
