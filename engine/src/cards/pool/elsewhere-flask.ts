import { defineCard } from "../define.js";

// EDHREC rank 11872.

export default defineCard({
  name: "Elsewhere Flask",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, draw a card.\nSacrifice this artifact: Choose a basic land type. Each land you control becomes that type until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        options: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
        prompt: "Choose a basic land type",
        then: {
          kind: "for-each-permanent",
          filter: { type: "land", controlledBy: "you" },
          simultaneous: true,
          effect: { kind: "add-types", target: 0, setSubtypes: ["$chosen"], duration: "end-of-turn" },
        },
      },
      resolve: null,
      text: "Sacrifice this artifact: Choose a basic land type. Each land you control becomes that type until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this artifact enters, draw a card.",
    },
  ],
});
