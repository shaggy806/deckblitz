import { defineCard } from "../define.js";

// The Adventure half of Promise of Aclazotz. "Sacrifice a non-Demon
// creature. If you do" isn't a may: with one, one is sacrificed (its
// controller's pick), and only a sacrifice that happened makes the token
// (Gearbane Orangutan's this-way check).
export default defineCard({
  name: "Foul Rebirth",
  art: "https://cards.scryfall.io/art_crop/back/b/8/b88a3b40-bf04-4017-be97-08ab86e331d1.jpg",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Sacrifice a non-Demon creature. If you do, create a 4/3 white and black Vampire Demon creature token with flying.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { type: "creature", notSubtypes: ["Demon"] }, count: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "sacrificed", who: "you" },
        then: { kind: "create-token", token: "Vampire Demon Token", count: 1 },
      },
    ],
  },
  faces: ["Promise of Aclazotz", "Foul Rebirth"],
  adventure: true,
});
