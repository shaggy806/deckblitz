import { defineCard } from "../define.js";

// EDHREC rank 18587.

export default defineCard({
  name: "Mizzium Meddler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 4,
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nWhen this creature enters, you may change a target of target spell or ability to this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "stack", spells: "any", abilities: true }],
      effect: { kind: "change-targets", target: 0, how: "change-one", to: "source", optional: true },
      resolve: null,
      text: "When this creature enters, you may change a target of target spell or ability to this creature.",
    },
  ],
});
