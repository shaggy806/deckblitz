import { defineCard } from "../define.js";

// EDHREC rank 19300.

const ROBOTS_TEXT = "When this Aura enters, create two 1/1 colorless Robot artifact creature tokens with flying.";

export default defineCard({
  name: "Robotics Mastery",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${ROBOTS_TEXT}\nEnchanted creature gets +2/+2.`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Flying)", count: 2 },
      resolve: null,
      text: ROBOTS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
