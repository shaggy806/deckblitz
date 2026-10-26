import { defineCard } from "../define.js";

// Saviors of Kamigawa. The enters trigger may target Kiri-Onna itself (and
// must, with no other creature — its ruling).
const ENTER_TEXT = "When this creature enters, return target creature to its owner's hand.";
const CAST_TEXT = "Whenever you cast a Spirit or Arcane spell, you may return this creature to its owner's hand.";

export default defineCard({
  name: "Kiri-Onna",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Spirit", "Arcane"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Kiri-Onna to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
