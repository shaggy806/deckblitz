import { defineCard } from "../define.js";

const TEXT = "When this creature dies, return it to the battlefield transformed under your control.";

// Edgar, Charmed Groom's return, under the dies trigger's controller rather
// than the owner.
export default defineCard({
  name: "Harvest Hand",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Harvest Hand", "Scrounged Scythe"],
  transform: true,
});
