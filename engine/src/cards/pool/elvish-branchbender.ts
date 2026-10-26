import { defineCard } from "../define.js";

// Rulings:
//   [2007-10-01] The value of X is determined when the ability resolves. It won’t change later,
//     even if the number of Elves you control changes. (`animate` reads its amounts once.)
//   [2007-10-01] If you control no Elves when the ability resolves, the Forest will become a 0/0
//     creature and be put into the graveyard.

export default defineCard({
  name: "Elvish Branchbender",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: "{T}: Until end of turn, target Forest becomes an X/X Treefolk creature in addition to its other types, where X is the number of Elves you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Forest" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: { countOf: { subtype: "Elf", controlledBy: "you" } },
        toughness: { countOf: { subtype: "Elf", controlledBy: "you" } },
        addTypes: ["creature"],
        addSubtypes: ["Treefolk"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Until end of turn, target Forest becomes an X/X Treefolk creature in addition to its other types, where X is the number of Elves you control.",
    },
  ],
});
