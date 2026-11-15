import { defineCard } from "../define.js";

// EDHREC rank 27920.

const TEXT =
  "Strange new worlds — When Ensign Chekov enters, each opponent exiles the top X cards of their library, where X is the number of differently named lands you control. For each opponent, choose a land card that player owns exiled this way. You may play the chosen cards for as long as they remain exiled.";

// X is read once for each opponent from your side; each opponent's choice is
// among only their own cards, and a chosen land is played as your land drop.
export default defineCard({
  name: "Ensign Pavel Chekov",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 1,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "exile-from-library",
              whose: "that-player",
              amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
            },
            {
              kind: "look-and-choose",
              zone: "exiled-this-way",
              min: 1,
              max: 1,
              filter: { type: "land", ownedByRef: "that-player" },
              destination: "stay",
              leftover: "stay",
              then: { kind: "grant-play", cards: 0, duration: "while-exiled", play: true },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
