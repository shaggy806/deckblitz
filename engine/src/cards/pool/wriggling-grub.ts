import { defineCard } from "../define.js";

export default defineCard({
  name: "Wriggling Grub",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, create two 1/1 black and green Worm creature tokens.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Worm Token", count: 2 },
      resolve: null,
      text: "When this creature dies, create two 1/1 black and green Worm creature tokens.",
    },
  ],
});
