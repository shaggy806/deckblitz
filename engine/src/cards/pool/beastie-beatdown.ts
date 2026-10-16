import { defineCard } from "../define.js";

// EDHREC rank 14629.
//
// Rulings:
//   [2024-09-20] If either creature is an illegal target as Beastie Beatdown tries to resolve, the
//     creature you control won't deal damage. If the creature you control is an illegal target,
//     you won't put two +1/+1 counters on it even if you have delirium.
//   [2024-09-20] You can't cast Beastie Beatdown unless you choose a creature you control and a
//     creature an opponent controls as targets.
//
// Giantfall's one-sided fight, after delirium's counters (read as it
// resolves), so the damage is the grown power.
export default defineCard({
  name: "Beastie Beatdown",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Choose target creature you control and target creature an opponent controls.\nDelirium — If there are four or more card types among cards in your graveyard, put two +1/+1 counters on the creature you control.\nThe creature you control deals damage equal to its power to the creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
