import { defineCard } from "../define.js";

// EDHREC rank 19099.

export default defineCard({
  name: "Wickerfolk Indomitable",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 4,
  toughness: 3,
  mayPlaySelf: { from: ["graveyard"], payLife: 2, sacrifice: { typesAnyOf: ["artifact", "creature"] } },
  text: "You may cast this card from your graveyard by paying 2 life and sacrificing an artifact or creature in addition to paying its other costs.",
});
