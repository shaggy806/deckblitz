import { defineCard } from "../define.js";

// Hellbent: "can't be countered" is checked as a counter would happen, the
// damage clause as the spell resolves.

const TEXT =
  "Demonfire deals X damage to any target. If a creature dealt damage this way would die this turn, exile it instead.\nHellbent — If you have no cards in hand, this spell can't be countered and the damage can't be prevented.";

export default defineCard({
  name: "Demonfire",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["any-target"],
  cantBeCountered: { kind: "hand-size", atMost: 0 },
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "hand-size", atMost: 0 },
        then: { kind: "damage", amount: "x", target: 0, cantBePrevented: true },
        else: { kind: "damage", amount: "x", target: 0 },
      },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
