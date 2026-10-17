import { defineCard } from "../define.js";

const SCRY = "Whenever an enchantment you control enters, scry 1.";
const PUMP = "{2}{W}: This creature gets +1/+1 until end of turn for each enchantment you control.";

export default defineCard({
  name: "Slumbering Keepguard",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: `${SCRY}\n${PUMP}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "enchantment", controlledBy: "you" } },
        toughness: { countOf: { type: "enchantment", controlledBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: SCRY,
    },
  ],
});
