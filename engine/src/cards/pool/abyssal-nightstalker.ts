import { defineCard } from "../define.js";

// EDHREC rank 27786.
//
// Rulings:
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it. It will trigger even if that creature was put
//     onto the battlefield attacking rather than having been declared as an attacker in the
//     declare attackers step.

const TEXT = "Whenever this creature attacks and isn't blocked, defending player discards a card.";

export default defineCard({
  name: "Abyssal Nightstalker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
