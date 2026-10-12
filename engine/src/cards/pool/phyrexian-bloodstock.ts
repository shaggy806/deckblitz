import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian Bloodstock",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 3,
  toughness: 3,
  text: "When this creature leaves the battlefield, destroy target white creature. It can't be regenerated.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { colors: ["W"], type: "creature" } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "When this creature leaves the battlefield, destroy target white creature. It can't be regenerated.",
    },
  ],
});
