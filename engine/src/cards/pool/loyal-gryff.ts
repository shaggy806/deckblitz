import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, you may return another creature you control to its owner's hand.";

export default defineCard({
  name: "Loyal Gryff",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Hippogriff"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Chosen as it resolves (its ruling) — Ambrosia Whiteheart's shape.
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 0,
        upTo: 1,
        exceptSource: true,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return another creature you control to its owner's hand?",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
