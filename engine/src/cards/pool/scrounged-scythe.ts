import { defineCard } from "../define.js";

// Gimli's Axe's shape: the menace static is gated on what the Equipment is
// attached to being a Human as it is now.
export default defineCard({
  name: "Scrounged Scythe",
  art: "https://cards.scryfall.io/art_crop/back/6/f/6f29b655-f70f-4b30-9253-c7944bfee524.jpg",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1.\nAs long as equipped creature is a Human, it has menace. (It can't be blocked except by two or more creatures.)\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
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
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Human" } } },
      grantKeywords: ["menace"],
      text: "As long as equipped creature is a Human, it has menace.",
    },
  ],
  faces: ["Harvest Hand", "Scrounged Scythe"],
  transform: true,
});
