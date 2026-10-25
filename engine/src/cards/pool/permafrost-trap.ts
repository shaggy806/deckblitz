import { defineCard } from "../define.js";

// The {U} is offered once a green creature entered under an opponent's
// control this turn (as it entered); the targets needn't include it (the
// ruling).
export default defineCard({
  name: "Permafrost Trap",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent had a green creature enter the battlefield under their control this turn, you may pay {U} rather than pay this spell's mana cost.\nTap up to two target creatures. Those creatures don't untap during their controller's next untap step.",
  alternativeCost: {
    mana: "{U}",
    condition: {
      kind: "turn-history",
      what: "entered",
      who: "opponent",
      filter: { type: "creature", colors: ["G"] },
    },
  },
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "tap", target: 1, doesntUntapNext: true },
    ],
  },
});
