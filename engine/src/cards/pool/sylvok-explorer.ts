import { defineCard } from "../define.js";

// EDHREC rank 23155. Fifth Dawn. Fellwar Stone's mana ability.

export default defineCard({
  name: "Sylvok Explorer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: "{T}: Add one mana of any color that a land an opponent controls could produce.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { producedBy: "opponents-lands" }, amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color that a land an opponent controls could produce.",
    },
  ],
});
