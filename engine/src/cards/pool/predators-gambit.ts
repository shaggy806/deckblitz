import { defineCard } from "../define.js";

// EDHREC rank 25195.

export default defineCard({
  name: "Predator's Gambit",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+1.\nEnchanted creature has intimidate as long as its controller controls no other creatures. (It can't be blocked except by artifact creatures and/or creatures that share a color with it.)",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 1], text: "Enchanted creature gets +2/+1." },
    {
      affects: { scope: "attached" },
      grantKeywords: ["intimidate"],
      // Its controller, not this Aura's. This Aura counts if it's a creature
      // too, so the static's skipping its own permanent is put back.
      condition: {
        kind: "of-player",
        player: "host-controller",
        condition: {
          kind: "not",
          of: { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeHost: true, countsSelf: true },
        },
      },
      text: "Enchanted creature has intimidate as long as its controller controls no other creatures.",
    },
  ],
});
