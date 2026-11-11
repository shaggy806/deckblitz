import { defineCard } from "../define.js";

// Rulings:
//   You choose whether or not to cast one of the exiled cards as Crabomination's triggered ability
//     resolves. Timing restrictions based on the card's type are ignored.
//   Crabomination's triggered ability doesn't allow you to play land cards; those, and any you
//     don't cast, remain in exile.

const TEXT =
  "When this creature enters, target opponent exiles the top card of their library, a card at random from their graveyard, and a card at random from their hand. You may cast a spell from among cards exiled this way without paying its mana cost.";

export default defineCard({
  name: "Crabomination",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Crab", "Demon"],
  power: 5,
  toughness: 5,
  emerge: { cost: "{5}{B}{B}", from: { type: "artifact" } },
  text: `Emerge from artifact {5}{B}{B} (You may cast this spell by sacrificing an artifact and paying the emerge cost reduced by that artifact's mana value.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: 0, amount: 1 },
          // Each pick goes in a slot of its own, beside the opponent in slot 0.
          { kind: "choose-random-card", zone: "graveyard", whose: 0, slot: 1, then: { kind: "exile", target: 1 } },
          { kind: "choose-random-card", zone: "hand", whose: 0, slot: 2, then: { kind: "exile", target: 2, fromHand: true } },
          { kind: "cast-now", from: "exiled-this-way", free: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
