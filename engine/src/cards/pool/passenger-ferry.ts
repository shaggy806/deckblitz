import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 17969.
//
// Taeko, the Patient Avalanche's shape: a reflexive ability (rule 603.12),
// its target chosen once {U} is paid — another attacking creature, never
// the Ferry itself.

const ATTACK_TEXT =
  "Whenever this Vehicle attacks, you may pay {U}. When you do, another target attacking creature can't be blocked this turn.";

export default defineCard({
  name: "Passenger Ferry",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {U} to make another target attacking creature unblockable this turn?",
        cost: "{U}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
          effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          text: "When you do, another target attacking creature can't be blocked this turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
