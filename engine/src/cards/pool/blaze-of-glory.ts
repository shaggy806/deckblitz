import { defineCard } from "../define.js";

// EDHREC rank 24362.
//
// "During combat before blockers are declared" is the beginning of combat
// and declare attackers steps (Panic's timing). Every opponent of the
// attacking player is a defending player for the whole combat phase (rules
// 506.2, 802.2), so it has a target before attackers are declared too.
// "Blocks each attacking creature if able" is one requirement per attacker it
// can block (`must-block` `each`, rule 509.1c): with "any number" it blocks
// every one it can.
const TIMING_TEXT = "Cast this spell only during combat before blockers are declared.";
const EFFECT_TEXT =
  "Target creature defending player controls can block any number of creatures this turn. It blocks each attacking creature this turn if able.";

export default defineCard({
  name: "Blaze of Glory",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${TIMING_TEXT}\n${EFFECT_TEXT}`,
  castOnlyIf: { kind: "turn-structure", steps: ["begin-combat", "declare-attackers"] },
  targets: [{ kind: "permanent", filter: { type: "creature", controlledByDefendingPlayer: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "block-additional", target: 0, amount: "any", duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: [{ kind: "must-block", each: true }] },
    ],
  },
});
