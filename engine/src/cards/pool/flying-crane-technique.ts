import { defineCard } from "../define.js";

// EDHREC rank 15060.
//
// "They" are the creatures you control as it resolves (the ruling) — the
// same set the untap reaches.

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Flying Crane Technique",
  manaCost: "{3}{U}{R}{W}",
  colors: ["U", "R", "W"],
  types: ["instant"],
  text: "Untap all creatures you control. They gain flying and double strike until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: YOURS },
      { kind: "grant-keyword-all", filter: YOURS, keyword: "flying", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: YOURS, keyword: "double-strike", duration: "end-of-turn" },
    ],
  },
});
