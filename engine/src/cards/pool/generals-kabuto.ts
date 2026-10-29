import { defineCard } from "../define.js";

// EDHREC rank 13910.
const SHROUD_TEXT = "Equipped creature has shroud. (It can't be the target of spells or abilities.)";
const PREVENT_TEXT = "Prevent all combat damage that would be dealt to equipped creature.";

export default defineCard({
  name: "General's Kabuto",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${SHROUD_TEXT}\n${PREVENT_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    { affects: { scope: "attached" }, grantKeywords: ["shroud"], text: SHROUD_TEXT },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: true, prevent: true, to: "attached" },
      text: PREVENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
