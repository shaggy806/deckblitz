import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, destroy target noncreature permanent. Its controller creates a 3/3 green Beast creature token.";

// A legal target that isn't destroyed (indestructible) still gives its
// controller the Beast; an illegal one stops the whole ability (the ruling).
export default defineCard({
  name: "Sawtusk Demolisher",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  mutate: "{3}{G}",
  text: `Mutate {3}{G} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nTrample\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "create-token", token: "3/3 Beast Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
