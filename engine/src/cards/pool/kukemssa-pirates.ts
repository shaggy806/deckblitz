import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 23043.
//
// Rulings:
//   An ability that triggers when something "attacks and isn't blocked" triggers in the declare
//     blockers step after blockers are declared if (1) that creature is attacking and (2) no
//     creatures are declared to block it. It will trigger even if that creature was put onto the
//     battlefield attacking rather than having been declared as an attacker in the declare
//     attackers step.
//
// Orcish Squatters' shape, with no duration on the control change.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may gain control of target artifact defending player controls. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Kukemssa Pirates",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [{ kind: "permanent", whose: "defending-player", filter: { type: "artifact" } }],
      effect: {
        kind: "may",
        prompt: "Gain control of the targeted artifact? Kukemssa Pirates then assigns no combat damage.",
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
