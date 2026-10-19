import { defineCard } from "../define.js";

// Rulings:
//   [2022-06-10] If Sharpshooter Elf leaves the battlefield while its triggered ability is on the
//     stack, use its power as it last existed on the battlefield to determine how much damage it
//     deals.
//
// `powerOf: "source"` reads the source's last-known power once it has left (608.2h), as
// Goblin Fireleaper's dies trigger does.

const POWER_TEXT = "Sharpshooter Elf's power is equal to the number of creatures you control.";
const ENTER_TEXT =
  "When this creature enters, it deals damage equal to its power to target creature with flying an opponent controls.";

export default defineCard({
  name: "Sharpshooter Elf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Ranger"],
  power: 0,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${POWER_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
