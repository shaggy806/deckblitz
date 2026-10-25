import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// Mirage (MIR). EDHREC rank 10122.
//
// The colour is chosen before it moves (rule 614.12 — `chooseOnEnter`), and
// its second ability taps for that colour (Black Dragon Gate's shape).

export default defineCard({
  name: "Quirion Elves",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 1,
  text: "As this creature enters, choose a color.\n{T}: Add {G}.\n{T}: Add one mana of the chosen color.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  activated: [
    manaTapAbility("G"),
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
  ],
});
