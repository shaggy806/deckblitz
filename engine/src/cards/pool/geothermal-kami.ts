import { defineCard } from "../define.js";

// EDHREC rank 26954.
//
// Not targeted: the enchantment is chosen as the trigger resolves (Ambrosia
// Whiteheart's "you may return"), and the life is gained only if one was
// returned this way (Stockpiling Celebrant's "if you do").
const ENTER_TEXT =
  "When this creature enters, you may return an enchantment you control to its owner's hand. If you do, you gain 3 life.";

export default defineCard({
  name: "Geothermal Kami",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "enchantment", controlledBy: "you" },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return an enchantment you control to its owner's hand?",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "gain-life", amount: 3 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
