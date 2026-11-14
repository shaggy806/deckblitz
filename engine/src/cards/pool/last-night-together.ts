import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 9038.
//
// "After this main phase, there is an additional combat phase" is
// `additional-combat`'s `afterThisPhase` (rule 500.8): straight after this main
// phase, with no additional main phase after it — from the precombat main
// phase it comes before the turn's own combat. "Only the chosen creatures can
// attack during that combat phase" is its `onlyAttackers`, the two targets as
// they are now (`inSet: { targets }`, bound as this resolves, so a creature
// that leaves and comes back is a new object and can't, rule 400.7).

const TEXT =
  "Choose two target creatures. Untap them. Put two +1/+1 counters on each of them. They gain vigilance, indestructible, and haste until end of turn. After this main phase, there is an additional combat phase. Only the chosen creatures can attack during that combat phase.";

const KEYWORDS = ["vigilance", "indestructible", "haste"] as const;

export default defineCard({
  name: "Last Night Together",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: TEXT,
  targets: distinctTargets(2, "creature"),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "untap", target: 1 },
      {
        kind: "sequence",
        together: true,
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 2 },
        ],
      },
      ...[0, 1].flatMap((target) =>
        KEYWORDS.map((keyword) => ({ kind: "grant-keyword" as const, target, keyword, duration: "end-of-turn" as const })),
      ),
      { kind: "additional-combat", afterThisPhase: true, onlyAttackers: { inSet: { targets: [0, 1] } } },
    ],
  },
});
