import { defineCard } from "../define.js";

const yours = { type: "creature", controlledBy: "you" } as const;

// "Those creatures": the ones that changed hands — now exactly the creatures
// you and that opponent control.
export default defineCard({
  name: "Twist Allegiance",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You and target opponent each gain control of all creatures the other controls until end of turn. Untap those creatures. Those creatures gain haste until end of turn.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exchange-control-all", filter: { type: "creature" }, with: { target: 0 }, untilEndOfTurn: true },
      { kind: "untap-all", filter: yours },
      { kind: "untap-all", filter: yours, controlledByTarget: 0 },
      { kind: "grant-keyword-all", filter: yours, keyword: "haste", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: yours, keyword: "haste", duration: "end-of-turn", controlledByTarget: 0 },
    ],
  },
});
