import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 8341.
//
// Each Forest and Saproling has both types and both subtypes (the ruling); a
// Saproling that's a Forest has "{T}: Add {G}" (rule 305.6), which summoning
// sickness still gates.

const TEXT =
  "All Forests and all Saprolings are 1/1 green Saproling creatures and Forest lands in addition to their other types. (They're affected by summoning sickness.)";

export default defineCard({
  name: "Life and Limb",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtypes: ["Forest", "Saproling"] } },
      addTypes: ["creature", "land"],
      addSubtypes: ["Saproling", "Forest"],
      setColors: ["G"],
      setBasePt: { power: 1, toughness: 1 },
      text: TEXT,
    },
  ],
});
