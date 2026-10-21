import { defineCard } from "../define.js";

export default defineCard({
  name: "Fountain of Ichor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add one mana of any color.\n{3}: This artifact becomes a 3/3 Dinosaur artifact creature until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Dinosaur"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{3}: This artifact becomes a 3/3 Dinosaur artifact creature until end of turn.",
    },
  ],
});
