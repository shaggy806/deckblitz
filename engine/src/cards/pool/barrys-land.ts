import { defineCard } from "../define.js";

// Playtest card (Unknown Event). A basic land of the Cloud land type — no
// basic land type of rule 305.6, so no intrinsic mana: its {C} is printed.

export default defineCard({
  name: "Barry's Land",
  colors: [],
  supertypes: ["basic"],
  types: ["land"],
  subtypes: ["Cloud"],
  text: "{T}: Add {C}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
});
