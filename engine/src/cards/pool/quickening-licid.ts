import { defineCard } from "../define.js";

// EDHREC rank 30225.

export default defineCard({
  name: "Quickening Licid",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 1,
  toughness: 1,
  text: "{1}{W}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {W} to end this effect.\nEnchanted creature has first strike.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{W}" },
      resolve: null,
      text: "{1}{W}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {W} to end this effect.",
      licid: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      text: "Enchanted creature has first strike.",
    },
  ],
});
