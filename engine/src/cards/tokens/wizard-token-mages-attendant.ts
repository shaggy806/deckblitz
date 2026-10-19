import { defineCard } from "../define.js";

/** Mage's Attendant's 1/1 blue Wizard that can sacrifice itself to tax a noncreature spell. */
const TEXT = "{1}, Sacrifice this creature: Counter target noncreature spell unless its controller pays {1}.";

export default defineCard({
  name: "Wizard Token (Mage's Attendant)",
  art: "c53eb7d1-9c36-4184-b411-ebe65aa64230",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["noncreature-spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
