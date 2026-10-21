import { defineCard } from "../define.js";

export default defineCard({
  name: "Mishra's Self-Replicator",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 2,
  toughness: 2,
  text: "Whenever you cast a historic spell, you may pay {1}. If you do, create a token that's a copy of this creature. (Artifacts, legendaries, and Sagas are historic.)",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a token that's a copy of Mishra's Self-Replicator?",
        cost: "{1}",
        effect: { kind: "create-token-copy", of: "source", count: 1 },
      },
      resolve: null,
      text: "Whenever you cast a historic spell, you may pay {1}. If you do, create a token that's a copy of this creature.",
    },
  ],
});
