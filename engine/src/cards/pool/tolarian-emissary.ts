import { defineCard } from "../define.js";

export default defineCard({
  name: "Tolarian Emissary",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{1}{W}" },
  text: "Kicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\nFlying\nWhen this creature enters, if it was kicked, destroy target enchantment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target enchantment.",
      condition: { kind: "self-kicked" },
    },
  ],
});
