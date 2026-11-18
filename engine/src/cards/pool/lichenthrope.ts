import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 29135.
//
// Rulings:
//   [2004-10-04] This card's effect replaces damage with placement of -1/-1 counters, so
//     side-effects of damage to it will not trigger.
//
// The damage becomes the counters (`instead: { effect }`, rules 614.1a,
// 614.6): no damage is dealt, so nothing that triggers on damage sees any (the
// ruling), and none is prevented, so damage that can't be prevented (615.12)
// is replaced all the same — not Anti-Venom's "prevent that damage and …".
const DAMAGE_TEXT = "If damage would be dealt to this creature, put that many -1/-1 counters on it instead.";
const UPKEEP_TEXT = "At the beginning of your upkeep, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Lichenthrope",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Fungus"],
  power: 5,
  toughness: 5,
  text: `${DAMAGE_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { effect: { kind: "add-counter", target: "source", counter: "-1/-1", amount: "x" } },
        to: "self",
      },
      text: DAMAGE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
