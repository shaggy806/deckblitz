import { defineCard } from "../define.js";

// Playtest card: Unknown Shores as an artifact land.

export default defineCard({
  name: "Artifact Unknown Shores",
  colors: [],
  types: ["artifact", "land"],
  text: "{T}: Add {C}.\n{1}, {T}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{1}, {T}: Add one mana of any color.",
    },
  ],
});
