import { defineCard } from "../define.js";

// EDHREC rank 9052. The Lesson count is read as the trigger resolves, before
// the spell that fired it has left the stack (the ruling).
const ENTER_TEXT = "When this enchantment enters, return up to one target instant or sorcery card from your graveyard to your hand.";
const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, draw a card. Then discard a card unless there are three or more Lesson cards in your graveyard.";

export default defineCard({
  name: "Chakra Meditation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } } },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 3, filter: { subtype: "Lesson" } } },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
