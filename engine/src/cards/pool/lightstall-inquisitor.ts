import { defineCard } from "../define.js";

export default defineCard({
  name: "Lightstall Inquisitor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, each opponent exiles a card from their hand and may play that card for as long as it remains exiled. Each spell cast this way costs {1} more to cast. Each land played this way enters tapped.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When this creature enters, each opponent exiles a card from their hand and may play that card for as long as it remains exiled. Each spell cast this way costs {1} more to cast. Each land played this way enters tapped.",
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
          mayPlay: { duration: "while-exiled", byOwner: true, tax: { generic: 1 }, landsEnterTapped: true, play: true },
        },
      },
    },
  ],
});
