import { defineCard } from "../define.js";

// "Kicked spells" (rule 702.33d): all of such a spell's cost, not just its kicker.
const PLAIN_TEXT = "{T}: Add {G}.";
const KICKED_TEXT = "{T}: Add {G}{G}. Spend this mana only to cast kicked spells.";

export default defineCard({
  name: "Elfhame Druid",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 0,
  toughness: 2,
  text: `${PLAIN_TEXT}\n${KICKED_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: PLAIN_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: 2,
        spendOnly: { purposes: ["kicked-spell"], text: "Spend this mana only to cast kicked spells." },
      },
      resolve: null,
      text: KICKED_TEXT,
    },
  ],
});
