import { defineCard } from "../define.js";

export default defineCard({
  name: "Gold-Forge Garrison",
  art: "https://cards.scryfall.io/art_crop/back/3/9/397ba02d-f347-46f7-b028-dd4ba55faa2f.jpg",
  colors: [],
  types: ["land"],
  text: "(Transforms from Golden Guardian.)\n{T}: Add two mana of any one color.\n{4}, {T}: Create a 4/4 colorless Golem artifact creature token.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 2 },
      resolve: null,
      text: "{T}: Add two mana of any one color.",
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Golem Token", count: 1 },
      resolve: null,
      text: "{4}, {T}: Create a 4/4 colorless Golem artifact creature token.",
    },
  ],
  faces: ["Golden Guardian", "Gold-Forge Garrison"],
  transform: true,
});
