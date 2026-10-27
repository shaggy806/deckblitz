import { defineCard } from "../define.js";

const GAIN = "When this creature enters, you gain 4 life.";
const REGEN = "{G}{W}, Sacrifice this creature: Regenerate each creature you control.";

export default defineCard({
  name: "Loxodon Hierarch",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 4,
  toughness: 4,
  text: `${GAIN}\n${REGEN}`,
  activated: [
    {
      cost: { mana: "{G}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "regenerate-all", filter: { type: "creature", controlledBy: "you" } },
      resolve: null,
      text: REGEN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: GAIN,
    },
  ],
});
