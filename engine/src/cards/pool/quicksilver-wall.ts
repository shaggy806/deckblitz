import { defineCard } from "../define.js";

// EDHREC rank 27861. "Any player may activate this ability": `anyPlayer` —
// an opponent may pay {4} to bounce it too.

const TEXT = "{4}: Return this creature to its owner's hand. Any player may activate this ability.";

export default defineCard({
  name: "Quicksilver Wall",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 6,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
