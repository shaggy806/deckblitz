import { defineCard } from "../define.js";

const TEXT = "When this creature enters, sacrifice it unless you return an artifact you control to its owner's hand.";

// Faerie Impostor's shape with an artifact: chosen on resolution, and the
// player may decline and sacrifice it even with an artifact (the rulings).
export default defineCard({
  name: "Glint Hawk",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "artifact", controlledBy: "you" },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return an artifact you control to its owner's hand, or sacrifice Glint Hawk",
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "returned-to-hand" } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
