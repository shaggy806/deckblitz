import { defineCard } from "../define.js";

// EDHREC rank 32620.
// Makes Officer → use "Officer Token".

export default defineCard({
  name: "Photosynthetic Physician",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Doctor"],
  power: 5,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\n{G}, Exile this card from your graveyard: Create a 1/1 red Officer creature token. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 1 },
      resolve: null,
      text: "{G}, Exile this card from your graveyard: Create a 1/1 red Officer creature token. Activate only as a sorcery.",
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
