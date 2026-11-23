import { defineCard } from "../define.js";

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Math is for Blockers",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Damage can't be prevented this turn.\nCreatures you control have double strike, trample, and must attack if able until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-cant-be-prevented" },
      // The creatures you control as it resolves (rule 611.2c).
      { kind: "grant-keyword-all", filter: YOURS, keyword: "double-strike", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: YOURS, keyword: "trample", duration: "end-of-turn" },
      { kind: "restrict", filter: YOURS, asItResolves: true, restrictions: ["must-attack"], duration: "end-of-turn" },
    ],
  },
});
