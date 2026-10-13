import { defineCard } from "../define.js";

// EDHREC rank 7154.

const MANA_TEXT = "{T}: Add an amount of {G} equal to this creature's power.";

export default defineCard({
  name: "Viridian Joiner",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 2,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { powerOf: "source" } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
