import { defineCard } from "../define.js";

// EDHREC rank 14162.
// Makes Goblin Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2026-06-29] Some spells and abilities that amass Goblins may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't amass Goblins.
//
// "Up to one target": with no target chosen the spell still resolves and
// amasses; with one chosen that has become illegal, it doesn't resolve.

export default defineCard({
  name: "Gathering of Darkness",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to one target creature card from your graveyard to your hand.\nAmass Goblins 3. (Put three +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)",
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "amass", amount: 3, creatureType: "Goblin" },
    ],
  },
});
