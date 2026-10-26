import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 29135.
//
// Rulings:
//   [2004-10-04] This card's effect replaces damage with placement of -1/-1 counters, so
//     side-effects of damage to it will not trigger.
//
// The damage replacement is the `would-deal-damage` replacement's `prevent` +
// `then` (Anti-Venom, Horrifying Healer's shape): no damage is dealt, so
// nothing that triggers on damage sees any (the ruling), and `perEvent` puts
// one batch of counters for a simultaneous event — "that many" its total. The
// engine has no "damage can't be prevented" effect, which is the one place a
// prevention and a replacement would part.
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
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "add-counter", target: "source", counter: "-1/-1", amount: "x" },
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
