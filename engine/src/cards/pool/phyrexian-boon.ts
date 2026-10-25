import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 30486.
//
// Gift of Fangs' shape, keyed on the enchanted creature's current colour.

const TEXT = "Enchanted creature gets +2/+1 as long as it's black. Otherwise, it gets -1/-2.";

export default defineCard({
  name: "Phyrexian Boon",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["B"] } } },
      grantPt: [2, 1],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { notColors: ["B"] } } },
      grantPt: [-1, -2],
      text: TEXT,
    },
  ],
});
