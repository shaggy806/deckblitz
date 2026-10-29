import { defineCard } from "../define.js";

// The opponent chooses the card, from their own hand: nobody else sees it
// before it's exiled.
const TEXT = "When this creature enters, target opponent exiles a card from their hand.";

export default defineCard({
  name: "Skullcap Snail",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus", "Snail"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
