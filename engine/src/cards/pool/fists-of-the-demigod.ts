import { defineCard } from "../define.js";

// Ruling: a creature that is both black and red gets both bonuses.

const BLACK =
  "As long as enchanted creature is black, it gets +1/+1 and has wither. (It deals damage to creatures in the form of -1/-1 counters.)";
const RED = "As long as enchanted creature is red, it gets +1/+1 and has first strike.";

export default defineCard({
  name: "Fists of the Demigod",
  manaCost: "{1}{B/R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BLACK}\n${RED}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["B"] } } },
      grantPt: [1, 1],
      grantKeywords: ["wither"],
      text: BLACK,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["R"] } } },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: RED,
    },
  ],
});
