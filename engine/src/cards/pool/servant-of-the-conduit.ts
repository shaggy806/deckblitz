import { defineCard } from "../define.js";

// Kaladesh.
const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";

export default defineCard({
  name: "Servant of the Conduit",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n{T}, Pay {E}: Add one mana of any color.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Pay {E}: Add one mana of any color.",
    },
  ],
});
