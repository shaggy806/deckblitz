import { defineCard } from "../define.js";

// EDHREC rank 32676.

export default defineCard({
  name: "Silicate Surveyor",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Tholian", "Scout"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, exile the top card of your library. Until the end of your next turn, you may play that card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: "When this creature enters, exile the top card of your library. Until the end of your next turn, you may play that card.",
    },
  ],
});
