import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const TEXT = "Whenever a creature you control dies, put a +1/+1 counter on equipped creature.";

export default defineCard({
  name: "Ghost Lantern",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
  faces: ["Ghost Lantern", "Bind Spirit"],
  adventure: true,
});
