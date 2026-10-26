import { defineCard } from "../define.js";

// EDHREC rank 16659.

export default defineCard({
  name: "Griffin Guide",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2 and has flying.\nWhen enchanted creature dies, create a 2/2 white Griffin creature token with flying.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +2/+2 and has flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Griffin Token", count: 1 },
      resolve: null,
      text: "When enchanted creature dies, create a 2/2 white Griffin creature token with flying.",
    },
  ],
});
