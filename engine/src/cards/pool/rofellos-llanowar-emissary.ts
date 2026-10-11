import { defineCard } from "../define.js";

// "Forest you control" is any permanent with the Forest land type — a basic
// Forest, a Breeding Pool, a land an effect made a Forest — counted as the
// ability is activated (a mana ability resolves at once).
export default defineCard({
  name: "Rofellos, Llanowar Emissary",
  manaCost: "{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 1,
  text: "{T}: Add {G} for each Forest you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: { countOf: { subtype: "Forest", controlledBy: "you" } },
      },
      resolve: null,
      text: "{T}: Add {G} for each Forest you control.",
    },
  ],
});
