import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK).
const ENTER_TEXT = "When this creature enters, destroy target artifact.";
const BOUNCE_TEXT = "Whenever you cast a Spirit or Arcane spell, you may return this creature to its owner's hand.";

export default defineCard({
  name: "Yuki-Onna",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
  text: `${ENTER_TEXT}\n${BOUNCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Yuki-Onna to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
