import { defineCard } from "../define.js";

// Each opponent chooses in turn, what they choose staying hidden in their hand,
// and then the chosen cards enter at once (rule 101.4).
const ENTER_TEXT =
  "When this creature enters, each opponent may put any number of artifact, creature, enchantment, and/or land cards from their hand onto the battlefield.";

export default defineCard({
  name: "Tempting Wurm",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        choicesHeld: true,
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 0,
          max: 99,
          filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] },
          destination: "battlefield",
          leftover: "stay",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
