import { defineCard } from "../define.js";

// Playtest card. Dauntless Dourbark's count (it counts itself, a Bear), and
// an enters fight with up to one target creature, any controller's.

const PT =
  "Drop Bear has power and toughness each equal to the number of Forests you control plus the number of Bears you control.";
const FIGHT = "When this creature enters, it fights up to one target creature.";

export default defineCard({
  name: "Drop Bear",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Koala", "Bear", "Horror"],
  power: 0,
  toughness: 0,
  keywords: ["flash", "haste"],
  text: `Flash, haste\n${PT}\n${FIGHT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          sum: [{ countOf: { subtype: "Forest", controlledBy: "you" } }, { countOf: { subtype: "Bear", controlledBy: "you" } }],
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: FIGHT,
    },
  ],
});
