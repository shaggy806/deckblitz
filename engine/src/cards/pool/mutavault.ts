import { defineCard } from "../define.js";

export default defineCard({
  name: "Mutavault",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}: This land becomes a 2/2 creature with all creature types until end of turn. It's still a land.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: ["(every creature type)"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}: This land becomes a 2/2 creature with all creature types until end of turn. It's still a land.",
    },
  ],
});
