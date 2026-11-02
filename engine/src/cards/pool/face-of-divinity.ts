import { defineCard } from "../define.js";

const PUMP = "Enchanted creature gets +2/+2.";
const ANOTHER = "As long as another Aura is attached to enchanted creature, it has first strike and lifelink.";

export default defineCard({
  name: "Face of Divinity",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${ANOTHER}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: PUMP },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "source",
        filter: { attachedTo: { attachments: { filter: { subtype: "Aura" }, otherThanSource: true } } },
      },
      grantKeywords: ["first-strike", "lifelink"],
      text: ANOTHER,
    },
  ],
});
