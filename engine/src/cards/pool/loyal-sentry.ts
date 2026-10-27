import { defineCard } from "../define.js";

// Starter 1999 (S99). EDHREC rank 20996. Both are destroyed at once, before
// combat damage; the blocked creature is destroyed even if this one has
// already left (its ruling) — the trigger object is read on its own.

const TEXT = "When this creature blocks a creature, destroy that creature and this creature.";

export default defineCard({
  name: "Loyal Sentry",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: "trigger-object" },
          { kind: "destroy", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
