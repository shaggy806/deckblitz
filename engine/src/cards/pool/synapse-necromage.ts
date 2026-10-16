import { defineCard } from "../define.js";

// EDHREC rank 17111.
// Makes Fungus → use "Fungus Token (Can't Block)".

export default defineCard({
  name: "Synapse Necromage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus", "Wizard"],
  power: 3,
  toughness: 1,
  text: "When this creature dies, create two 1/1 black Fungus creature tokens with \"This token can't block.\"",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Fungus Token (Can't Block)", count: 2 },
      resolve: null,
      text: "When this creature dies, create two 1/1 black Fungus creature tokens with \"This token can't block.\"",
    },
  ],
});
