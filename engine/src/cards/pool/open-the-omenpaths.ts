import { defineCard } from "../define.js";

// Kaldheim. The mode is chosen as it's cast; the colours, as the mana is added (rule 608.2d):
// `add-mana`'s `different` asks a mode per pairing on the stack.

const MANA = "Add two mana of any one color and two mana of any other color. Spend this mana only to cast creature or enchantment spells.";
const PUMP = "Creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Open the Omenpaths",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${MANA}\n• ${PUMP}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MANA,
        targets: [],
        effect: {
          kind: "add-mana",
          mana: { oneOf: ["W", "U", "B", "R", "G"], different: 2 },
          amount: 4,
          spendOnly: {
            spell: { anyOf: [{ type: "creature" }, { type: "enchantment" }] },
            text: "Spend this mana only to cast creature or enchantment spells.",
          },
        },
      },
      {
        text: PUMP,
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
