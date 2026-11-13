import { defineCard } from "../define.js";

export default defineCard({
  name: "The Tomb of Aclazotz",
  art: "https://cards.scryfall.io/art_crop/back/9/9/99255a66-b868-45fc-a2a9-0c89bd851b69.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  subtypes: ["Cave"],
  text: "(Transforms from Tarrian's Journal.)\n{T}: Add {B}.\n{T}: You may cast a creature spell from your graveyard this turn. If you do, it enters with a finality counter on it and is a Vampire in addition to its other types. (If a creature with a finality counter on it would die, exile it instead.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        mayPlay: {
          from: "graveyard",
          filter: { type: "creature" },
          upTo: 1,
          entersWith: { kind: "finality", amount: 1 },
          becomes: { addSubtypes: ["Vampire"] },
        },
      },
      resolve: null,
      text: "{T}: You may cast a creature spell from your graveyard this turn. If you do, it enters with a finality counter on it and is a Vampire in addition to its other types.",
    },
  ],
  faces: ["Tarrian's Journal", "The Tomb of Aclazotz"],
  transform: true,
});
