import { defineCard } from "../define.js";

// EDHREC rank 9411.
//
// The group's bound is read as the trigger goes on the stack, after the
// merge that fired it, so it counts this mutation.

const TEXT =
  "Whenever this creature mutates, tap up to X target creatures, where X is the number of times this creature has mutated. Those creatures don't untap during their controller's next untap step.";

export default defineCard({
  name: "Archipelagore",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 7,
  toughness: 7,
  mutate: "{5}{U}",
  text: `Mutate {5}{U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: { timesMutated: "source" } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "tap", target: 0, doesntUntapNext: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
