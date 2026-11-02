import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

const TEXT =
  "Enchanted creature gets -2/-0. It gets -6/-0 instead as long as its controller has seven or more cards in their graveyard.";

// Read continuously, from whoever controls the creature now (the ruling).
const SEVEN: StaticCondition = {
  kind: "of-player",
  player: "host-controller",
  condition: { kind: "threshold" },
};

export default defineCard({
  name: "So Tiny",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, condition: { kind: "not", of: SEVEN }, grantPt: [-2, 0], text: TEXT },
    { affects: { scope: "attached" }, condition: SEVEN, grantPt: [-6, 0], text: TEXT },
  ],
});
