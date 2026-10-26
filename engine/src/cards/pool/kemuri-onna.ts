import { defineCard } from "../define.js";

// EDHREC rank 26374.
const ENTER_TEXT = "When this creature enters, target player discards a card.";
const CAST_TEXT = "Whenever you cast a Spirit or Arcane spell, you may return this creature to its owner's hand.";

export default defineCard({
  name: "Kemuri-Onna",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Kemuri-Onna to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
