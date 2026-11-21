import { defineCard } from "../define.js";

// EDHREC rank 18148. Fifth Edition (5ED).
//
// Each player, the active player first, chooses how many to discard (none to
// three) and which; then they're all discarded at once (rule 101.4), and each
// player is dealt 3 minus the number they themselves discarded.

export default defineCard({
  name: "Mind Bomb",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player may discard up to three cards. Mind Bomb deals damage to each player equal to 3 minus the number of cards they discarded this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "each-player", amount: 0, anyNumber: true, atMost: 3 },
      { kind: "damage", who: "each-player", amount: { difference: [3, { thisWay: "discarded", who: "each" }] } },
    ],
  },
});
