import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 23671.
//
// Rulings: it resolves fully — the counter goes on even when the 1 damage is
// already lethal (no state-based actions mid-resolution, rule 608.2), so a
// 1-toughness creature dies of 0 toughness and regeneration can't save it.
export default defineCard({
  name: "Puncture Bolt",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Puncture Bolt deals 1 damage to target creature. Put a -1/-1 counter on that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
    ],
  },
});
