import { defineCard } from "../define.js";

// EDHREC rank 2366.

export default defineCard({
  name: "Sceptre of Eternal Glory",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "{T}: Add one mana of any color.\n{T}: Add three mana of any one color. Activate only if you control three or more lands with the same name.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: "{T}: Add three mana of any one color. Activate only if you control three or more lands with the same name.",
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 3, sharingAName: true },
    },
  ],
});
