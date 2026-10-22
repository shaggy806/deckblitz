import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Ice Age. The granted "{0}: Untap this creature. Activate only once." lasts
// only until end of turn, so "only once" over its whole life is "only once
// this turn": `oncePerTurn`, whose bookkeeping clears at the turn's end —
// rather than `exhaust`, whose per-index record would outlive the grant and
// could shut a later ability at the same index. The draw is Carrier Pigeons'
// delayed trigger.

const GRANTED_TEXT = "{0}: Untap this creature. Activate only once.";
const UNTAP_ONCE: ActivatedAbility = {
  cost: { mana: "{0}", tap: false },
  targets: [],
  effect: { kind: "untap", target: "source" },
  resolve: null,
  text: GRANTED_TEXT,
  oncePerTurn: true,
};

export default defineCard({
  name: "Touch of Vitae",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Until end of turn, target creature gains haste and "${GRANTED_TEXT}"\nDraw a card at the beginning of the next turn's upkeep.`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "grant-activated", target: 0, ability: UNTAP_ONCE, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
