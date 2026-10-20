import { defineCard } from "../define.js";

const TEXT = "Enchanted creature gets +2/+2 as long as it's a Vampire. Otherwise, it gets -2/-2.";

export default defineCard({
  name: "Gift of Fangs",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Vampire" } } },
      grantPt: [2, 2],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { notSubtypes: ["Vampire"] } } },
      grantPt: [-2, -2],
      text: TEXT,
    },
  ],
});
