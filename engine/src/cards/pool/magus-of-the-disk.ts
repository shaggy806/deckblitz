import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 15159.
//
// Nevinyrral's Disk on a creature that enters tapped. It destroys itself too,
// unless something regenerates it or makes it indestructible (the ruling).
export default defineCard({
  name: "Magus of the Disk",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 4,
  text: "This creature enters tapped.\n{1}, {T}: Destroy all artifacts, creatures, and enchantments.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } },
      resolve: null,
      text: "{1}, {T}: Destroy all artifacts, creatures, and enchantments.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
});
