import { defineCard } from "../define.js";

export default defineCard({
  name: "Aethersnipe",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  evoke: { cost: "{1}{U}{U}" },
  text: "When this creature enters, return target nonland permanent to its owner's hand.\nEvoke {1}{U}{U} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "When this creature enters, return target nonland permanent to its owner's hand.",
    },
  ],
});
