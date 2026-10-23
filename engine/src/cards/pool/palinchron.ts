import { defineCard } from "../define.js";

// Rulings: 0 to 7 lands, chosen as the trigger resolves — not targeted, and
// any player's lands.
export default defineCard({
  name: "Palinchron",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, untap up to seven lands.\n{2}{U}{U}: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{2}{U}{U}: Return this creature to its owner's hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land" },
        upTo: 7,
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to seven lands",
      },
      resolve: null,
      text: "When this creature enters, untap up to seven lands.",
    },
  ],
});
