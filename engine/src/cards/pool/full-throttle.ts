import { defineCard } from "../define.js";

// EDHREC rank 1331.
//
// The two phases go straight after this main phase, with no main phase between
// them: from the precombat main, ahead of the turn's own combat; from the
// postcombat main, with the end step next (the rulings; rule 500.8). Cast when
// it's no main phase (Vedalken Orrery), there are no additional phases, but the
// second ability still works; cast in an opponent's main phase, that opponent
// attacks in them (the rulings). The second ability is a delayed one with a
// duration, so it triggers in each combat left this turn, the turn's own too
// (rule 603.7b), and on nothing that began before it existed (603.7a).

const PHASES = "After this main phase, there are two additional combat phases.";
const UNTAP = "At the beginning of each combat this turn, untap all creatures that attacked this turn.";

export default defineCard({
  name: "Full Throttle",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${PHASES}\n${UNTAP}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
        then: {
          kind: "sequence",
          effects: [
            { kind: "additional-combat", afterThisPhase: true },
            { kind: "additional-combat", afterThisPhase: true },
          ],
        },
      },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "step-begins", step: "begin-combat", who: "any" } },
        effect: { kind: "untap-all", filter: { type: "creature", attackedThisTurn: true } },
        text: UNTAP,
      },
    ],
  },
});
