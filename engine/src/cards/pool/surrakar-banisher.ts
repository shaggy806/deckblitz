import { defineCard } from "../define.js";

export default defineCard({
  name: "Surrakar Banisher",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Surrakar"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, you may return target tapped creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target tapped creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may return target tapped creature to its owner's hand.",
    },
  ],
});
