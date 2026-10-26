import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 26679. Fylgja's abilities on the creature itself.

export default defineCard({
  name: "Ursine Fylgja",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Bear"],
  power: 3,
  toughness: 3,
  text: "This creature enters with four healing counters on it.\nRemove a healing counter from this creature: Prevent the next 1 damage that would be dealt to this creature this turn.\n{2}{W}: Put a healing counter on this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "healing", count: 1 } },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: "Remove a healing counter from this creature: Prevent the next 1 damage that would be dealt to this creature this turn.",
    },
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "healing", amount: 1 },
      resolve: null,
      text: "{2}{W}: Put a healing counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "healing", amount: 4 } },
      text: "This creature enters with four healing counters on it.",
    },
  ],
});
