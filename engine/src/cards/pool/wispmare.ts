import { defineCard } from "../define.js";

export default defineCard({
  name: "Wispmare",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  evoke: { cost: "{W}" },
  text: "Flying\nWhen this creature enters, destroy target enchantment.\nEvoke {W} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target enchantment.",
    },
  ],
});
