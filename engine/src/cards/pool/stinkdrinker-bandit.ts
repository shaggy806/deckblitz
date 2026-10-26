import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

// EDHREC rank 13165.
//
// Rulings:
//   [2008-04-01] This ability triggers after blockers are declared during the declare blockers
//     step. Each attacking Rogue you control gets +2/+1 if no creatures were assigned to block it.
//     That creature will get the bonus even if an effect causes it to become blocked.
//   [2013-04-15] An ability that triggers when something “attacks and isn’t blocked” triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it. It will trigger even if that creature was put
//     onto the battlefield attacking rather than having been declared as an attacker in the
//     declare attackers step.

export default defineCard({
  name: "Stinkdrinker Bandit",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  text: "Prowl {1}{B} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Goblin or Rogue.)\nWhenever a Rogue you control attacks and isn't blocked, it gets +2/+1 until end of turn.",
  alternativeCost: prowl("{1}{B}"),
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "you-control", filter: { type: "creature", subtype: "Rogue" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a Rogue you control attacks and isn't blocked, it gets +2/+1 until end of turn.",
    },
  ],
});
