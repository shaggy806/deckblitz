import { defineCard } from "../define.js";

// The reveal is to every player (rule 701.20a) and does nothing more; the
// card stays in its owner's hand.

const TEXT = "{3}{B}, {T}: Target opponent loses 2 life, then reveals a card at random from their hand.";

export default defineCard({
  name: "Hired Torturer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "choose-random-card", zone: "hand", whose: 0, show: "reveal" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
