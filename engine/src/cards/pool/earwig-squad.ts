import { defineCard } from "../define.js";

// EDHREC rank 20200.

export default defineCard({
  name: "Earwig Squad",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 5,
  toughness: 3,
  alternativeCost: { mana: "{2}{B}", keyword: "prowl", condition: { kind: "prowl" } },
  text: "Prowl {2}{B} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Goblin or Rogue.)\nWhen this creature enters, if its prowl cost was paid, search target opponent's library for three cards and exile them. Then that player shuffles.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "search-library",
        whose: { target: 0 },
        filter: {},
        destination: "exile",
        min: 3,
        max: 3,
      },
      resolve: null,
      text: "When this creature enters, if its prowl cost was paid, search target opponent's library for three cards and exile them. Then that player shuffles.",
      condition: { kind: "self-prowl-paid" },
    },
  ],
});
