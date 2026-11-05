import { defineCard } from "../define.js";

const TEXT = "{2}, Reveal X blue cards from your hand, Sacrifice this creature: Counter target spell unless its controller pays {X}.";

export default defineCard({
  name: "Martyr of Frost",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self", reveal: { count: "x", filter: { colors: ["U"] }, text: "blue cards" } },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ payGeneric: "x", text: "Pay {X}." }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
