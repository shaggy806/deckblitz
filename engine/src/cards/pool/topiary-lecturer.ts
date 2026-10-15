import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// EDHREC rank 7070. Secrets of Strixhaven. The mana ability reads its power
// as it's activated (Kami of Whispered Hopes's shape).

const INCREMENT = increment();
const MANA_TEXT = "{T}: Add an amount of {G} equal to this creature's power.";

export default defineCard({
  name: "Topiary Lecturer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 2,
  text: `${INCREMENT.text}\n${MANA_TEXT}`,
  triggered: [INCREMENT],
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
