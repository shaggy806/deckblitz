import { defineCard } from "../define.js";

export default defineCard({
  name: "Cursecatcher",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Counter target instant or sorcery spell unless its controller pays {1}.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["instant-or-sorcery-spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "Sacrifice this creature: Counter target instant or sorcery spell unless its controller pays {1}.",
    },
  ],
});
