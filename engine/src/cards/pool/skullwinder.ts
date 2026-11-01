import { defineCard } from "../define.js";

// You return the target first, then choose the opponent as the ability resolves
// (the rulings), any opponent, even one with an empty graveyard, who then picks
// which card of theirs to return.
const TEXT =
  "When this creature enters, return target card from your graveyard to your hand, then choose an opponent. That " +
  "player returns a card from their graveyard to their hand.";

export default defineCard({
  name: "Skullwinder",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          {
            kind: "choose-opponent",
            then: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "graveyard",
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
