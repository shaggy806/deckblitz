import { defineCard } from "../define.js";

// EDHREC rank 5916.
//
// Rulings:
//   [2017-03-14] All of the actions for Cruel Ultimatum are performed sequentially, in the order
//     listed. … When Cruel Ultimatum lets you return a creature card from your graveyard to your
//     hand, you can choose that one [the creature the opponent sacrificed, if you own it].
//   [2017-03-14] Cruel Ultimatum's only target is an opponent. You don't choose which creature
//     card in your graveyard you'll return to your hand until Cruel Ultimatum resolves.

export default defineCard({
  name: "Cruel Ultimatum",
  manaCost: "{U}{U}{B}{B}{B}{R}{R}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text: "Target opponent sacrifices a creature of their choice, discards three cards, then loses 5 life. You return a creature card from your graveyard to your hand, draw three cards, then gain 5 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      { kind: "discard", target: 0, amount: 3 },
      { kind: "lose-life", target: 0, amount: 5 },
      { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "hand", count: 1 },
      { kind: "draw", amount: 3 },
      { kind: "gain-life", amount: 5 },
    ],
  },
});
