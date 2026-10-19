import { defineCard } from "../define.js";

// EDHREC rank 10174. Preposterous Proportions' shape, with lifelink beside
// vigilance.

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "For the Emperor!",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Creatures you control get +2/+2 and gain vigilance and lifelink until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: YOURS, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: YOURS, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: YOURS, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
