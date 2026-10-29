import { defineCard } from "../define.js";

const yours = { type: "creature", controlledBy: "you" } as const;

// "Those creatures": the ones that changed hands, which are now exactly the
// creatures you and that opponent control — every other player's are left
// alone (the 2007 ruling: only yours and the target opponent's untap).
export default defineCard({
  name: "Reins of Power",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Untap all creatures you control and all creatures target opponent controls. You and that opponent each gain control of all creatures the other controls until end of turn. Those creatures gain haste until end of turn.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: yours },
      { kind: "untap-all", filter: yours, controlledByTarget: 0 },
      { kind: "exchange-control-all", filter: { type: "creature" }, with: { target: 0 }, untilEndOfTurn: true },
      { kind: "grant-keyword-all", filter: yours, keyword: "haste", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: yours, keyword: "haste", duration: "end-of-turn", controlledByTarget: 0 },
    ],
  },
});
