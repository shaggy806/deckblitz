import { defineCard } from "../define.js";

// EDHREC rank 13086.
//
// Rulings:
//   [2025-04-04] You can’t cast Lie in Wait unless you choose a creature card in your graveyard
//     and a creature on the battlefield as targets.
//   [2025-04-04] Use the power of the card in the graveyard to determine how much damage Lie in
//     Wait deals to the target creature.
//
// Golbez, Crystal Collector's shape: "that card's power" is the returned
// card's printed power (what it had in the graveyard, where no effect reached
// it). If the card has left the graveyard by then, it's an illegal target and
// its power can't be determined, so no damage is dealt (rule 608.2b).

export default defineCard({
  name: "Lie in Wait",
  manaCost: "{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to your hand. Lie in Wait deals damage equal to that card's power to target creature.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "damage", amount: { powerOf: 0 }, target: 1 },
    ],
  },
});
