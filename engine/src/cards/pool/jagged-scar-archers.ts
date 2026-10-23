import { defineCard } from "../define.js";

// EDHREC rank 8042.
// A characteristic-defining ability (rule 604.3): it counts itself, an Elf.

const PT_TEXT = "Jagged-Scar Archers's power and toughness are each equal to the number of Elves you control.";
const PING_TEXT = "{T}: This creature deals damage equal to its power to target creature with flying.";

export default defineCard({
  name: "Jagged-Scar Archers",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${PING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Elf", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
