import { defineCard } from "../define.js";

// EDHREC rank 17544.
export default defineCard({
  name: "Silhana Starfletcher",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Archer"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nAs this creature enters, choose a color.\n{T}: Add one mana of the chosen color.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
  ],
});
