import { defineCard } from "../define.js";

// "Creatures you control" is asked as each damage would be dealt (rule
// 615.1), not fixed as it resolves.
export default defineCard({
  name: "Sivvi's Ruse",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "If an opponent controls a Mountain and you control a Plains, you may cast this spell without paying its mana cost.\nPrevent all damage that would be dealt this turn to creatures you control.",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Mountain" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      ],
    },
  },
  targets: [],
  effect: { kind: "damage-rule", to: { permanents: { type: "creature", controlledBy: "you" } } },
});
