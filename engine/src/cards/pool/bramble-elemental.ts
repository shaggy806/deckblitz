import { defineCard } from "../define.js";

// EDHREC rank 27277. Moved here or entering attached alike (the ruling).
const TEXT = "Whenever an Aura becomes attached to this creature, create two 1/1 green Saproling creature tokens.";

export default defineCard({
  name: "Bramble Elemental",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-attached", onto: "self", attachment: { subtype: "Aura" } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
