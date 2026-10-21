import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, other creatures you control get +X/+X until end of turn, where X is the number of times this creature has mutated.";

// X is read once, as the ability resolves (the ruling), and only the
// creatures you control then get the bonus.
export default defineCard({
  name: "Huntmaster Liger",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 4,
  mutate: "{2}{W}",
  text: `Mutate {2}{W} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { timesMutated: "source" },
        toughness: { timesMutated: "source" },
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
