import { defineCard } from "../define.js";

/**
 * Heartwood — a predefined token (Reality Fracture), like Treasure: "a red
 * and green artifact with the artifact subtype Heartwood and the ability
 * '{T}: Add {R} or {G}.'" (the rulings). A mana ability; `oneOf` with an
 * amount of 1 is the one mana, of the player's pick.
 */
export default defineCard({
  name: "Heartwood Token",
  art: "eb4bf635-04d7-4994-9f70-4ff573a767e7",
  colors: ["R", "G"],
  types: ["artifact"],
  subtypes: ["Heartwood"],
  text: "{T}: Add {R} or {G}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {G}.",
    },
  ],
});
