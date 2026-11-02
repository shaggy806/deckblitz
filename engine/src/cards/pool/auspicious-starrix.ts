import { defineCard } from "../define.js";

const TRIGGER =
  "Whenever this creature mutates, exile cards from the top of your library until you exile X permanent cards, where X is the number of times this creature has mutated. Put those permanent cards onto the battlefield.";

export default defineCard({
  name: "Auspicious Starrix",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk", "Beast"],
  power: 6,
  toughness: 6,
  mutate: "{5}{G}",
  text: `Mutate {5}{G} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until-count",
        filter: { notTypes: ["instant", "sorcery"] },
        count: { timesMutated: "source" },
        exile: true,
        rest: "stay",
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
