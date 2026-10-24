import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

export default defineCard({
  name: "Neurok Stealthsuit",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has shroud. (It can't be the target of spells or abilities.)\n{U}{U}: Attach this Equipment to target creature you control.\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      // Cranial Plating's shape: an attach at instant speed.
      cost: { mana: "{U}{U}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "{U}{U}: Attach this Equipment to target creature you control.",
    },
    equip("{1}"),
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["shroud"],
      text: "Equipped creature has shroud.",
    },
  ],
});
