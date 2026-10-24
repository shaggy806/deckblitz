import { defineCard } from "../define.js";


export default defineCard({
  name: "Ulrich, Uncontested Alpha",
  art: "https://cards.scryfall.io/art_crop/back/3/e/3e2011f0-a640-4579-bd67-1dfbc09b8c09.jpg",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 6,
  text: "Whenever this creature transforms into Ulrich, Uncontested Alpha, you may have it fight target non-Werewolf creature you don't control.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform Ulrich.",
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Werewolf"], controlledBy: "opponent" } }],
      effect: { kind: "may", prompt: "Have Ulrich fight the target creature?", effect: { kind: "fight", a: "source", b: 0 } },
      resolve: null,
      text: "Whenever this creature transforms into Ulrich, Uncontested Alpha, you may have it fight target non-Werewolf creature you don't control.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform Ulrich.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Ulrich of the Krallenhorde", "Ulrich, Uncontested Alpha"],
  transform: true,
});
