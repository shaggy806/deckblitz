import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 21731. "Equip Detective {1}" is Blackblade Reforged's "Equip
// legendary creature {3}" shape: an equip ability whose target is narrowed
// (rule 702.6a), beside the ordinary Equip {3}.

export default defineCard({
  name: "Thinking Cap",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+2.\nEquip Detective {1}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Detective" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Detective {1}",
      sorcerySpeed: true,
    },
    equip("{3}"),
  ],
});
