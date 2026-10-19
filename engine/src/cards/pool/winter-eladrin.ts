import { defineCard } from "../define.js";

// EDHREC rank 15884.

const TEXT = "Gust of Wind — When this creature enters, return up to one other target creature to its owner's hand.";

export default defineCard({
  name: "Winter Eladrin",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Elf", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
