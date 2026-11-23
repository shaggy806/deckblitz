import { defineCard } from "../define.js";


export default defineCard({
  name: "Riven Turnbull and Princess Lucrezia",
  manaCost: "{5}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor", "Wizard"],
  power: 10,
  toughness: 11,
  text: "{T}: Add {U}{B}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["U", "B"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U}{B}.",
    },
  ],
});
