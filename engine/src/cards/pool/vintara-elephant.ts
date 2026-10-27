import { defineCard } from "../define.js";

// EDHREC rank 32053. "Any player may activate this ability": `anyPlayer`.

const TEXT = "{3}: This creature loses trample until end of turn. Any player may activate this ability.";

export default defineCard({
  name: "Vintara Elephant",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["trample"], duration: "end-of-turn" },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
