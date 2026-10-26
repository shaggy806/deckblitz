import { defineCard } from "../define.js";

const RED_TEXT =
  "As long as enchanted creature is red, it gets +1/+1 and has double strike. (It deals both first-strike and regular combat damage.)";
const GREEN_TEXT = "As long as enchanted creature is green, it gets +1/+1 and has trample.";

export default defineCard({
  name: "Runes of the Deus",
  manaCost: "{4}{R/G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${RED_TEXT}\n${GREEN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["R"] } } },
      grantPt: [1, 1],
      grantKeywords: ["double-strike"],
      text: RED_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["G"] } } },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: GREEN_TEXT,
    },
  ],
});
