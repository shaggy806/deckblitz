import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const TEXT = "Whenever equipped creature deals combat damage to a player, destroy all permanents other than this Equipment.";

export default defineCard({
  name: "Worldslayer",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {5} ({5}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "destroy-all", filter: {}, exceptSource: true },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [equip("{5}")],
});
