import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

const TEXT =
  "Enchanted creature gets +10/+10 and has trample and annihilator 2. (Whenever it attacks, defending player sacrifices two permanents of their choice.)";

export default defineCard({
  name: "Eldrazi Conscription",
  manaCost: "{8}",
  colors: [],
  types: ["kindred", "enchantment"],
  subtypes: ["Eldrazi", "Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [10, 10],
      grantKeywords: ["trample"],
      grantsTriggered: [annihilator(2)],
      text: TEXT,
    },
  ],
});
