import { defineCard } from "../define.js";

const HEX_TEXT = "When this creature enters, create a Cursed Role token attached to target creature you control.";

export default defineCard({
  name: "Spiteful Hexmage",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 2,
  text: `${HEX_TEXT} (If you control another Role on it, put that one into the graveyard. Enchanted creature is 1/1.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "create-token", token: "Cursed Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: HEX_TEXT,
    },
  ],
});
