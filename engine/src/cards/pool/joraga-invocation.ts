import { defineCard } from "../define.js";

// "Each creature you control gets +3/+3 … and must be blocked this turn if
// able": the bonus fixes the set as it resolves (rule 611.2c), so the
// requirement binds those creatures only — `restrict`'s `asItResolves`.
const TEXT = "Each creature you control gets +3/+3 until end of turn and must be blocked this turn if able.";

export default defineCard({
  name: "Joraga Invocation",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 3,
        toughness: 3,
        duration: "end-of-turn",
      },
      {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        asItResolves: true,
        restrictions: ["must-be-blocked-if-able"],
      },
    ],
  },
});
