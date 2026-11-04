import { defineCard } from "../define.js";

// Rulings:
//   If Bane Alley Broker leaves the battlefield, the cards exiled with it will be exiled
//     indefinitely. If it later returns to the battlefield, it will be a new object with no
//     connection to the cards exiled with it in its previous existence.
//   Once you are allowed to look at a face-down card in exile, you are allowed to look at that card
//     as long as it's exiled. If you no longer control Bane Alley Broker when its last ability
//     resolves, you can continue to look at the relevant cards in exile to choose one to return.
//   If Bane Alley Broker's first ability resolves when you have no cards in your hand, you'll draw
//     a card and then exile it.

const EXILE_TEXT = "{T}: Draw a card, then exile a card from your hand face down.";
const RETURN_TEXT = "{U}{B}, {T}: Return a card exiled with this creature to its owner's hand.";

export default defineCard({
  name: "Bane Alley Broker",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 0,
  toughness: 3,
  // "You may look at cards exiled with this creature" is how a face-down card a
  // look-and-choose exiles reads by default: its chooser, and whoever comes to
  // control this creature (`faceDownLooks`).
  text: `${EXILE_TEXT}\nYou may look at cards exiled with this creature.\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      resolve: null,
      text: EXILE_TEXT,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "exile-face-down", leftover: "stay" },
        ],
      },
    },
    {
      cost: { mana: "{U}{B}", tap: true },
      resolve: null,
      text: RETURN_TEXT,
      targets: [],
      effect: { kind: "look-and-choose", zone: "exiled-with-source", min: 1, max: 1, destination: "hand", leftover: "stay" },
    },
  ],
});
