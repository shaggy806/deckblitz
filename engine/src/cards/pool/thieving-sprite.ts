import { defineCard } from "../define.js";

// EDHREC rank 21655.

export default defineCard({
  name: "Thieving Sprite",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target player reveals X cards from their hand, where X is the number of Faeries you control. You choose one of those cards. That player discards that card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        reveals: { countOf: { subtype: "Faerie", controlledBy: "you" } },
      },
      resolve: null,
      text: "When this creature enters, target player reveals X cards from their hand, where X is the number of Faeries you control. You choose one of those cards. That player discards that card.",
    },
  ],
});
