import { defineCard } from "../define.js";

const CREATURES_YOU_CONTROL = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "King Harald's Revenge",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Until end of turn, target creature gets +1/+1 for each creature you control and gains trample. It must be blocked this turn if able.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: CREATURES_YOU_CONTROL,
        toughness: CREATURES_YOU_CONTROL,
        duration: "end-of-turn",
      },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});
