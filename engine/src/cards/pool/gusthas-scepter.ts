import { defineCard } from "../define.js";

// Rulings:
//   The last ability will trigger when a different player gains control of Gustha's Scepter, as
//     well as when Gustha's Scepter leaves the battlefield.

const EXILE_TEXT = "{T}: Exile a card from your hand face down. You may look at it for as long as it remains exiled.";
const RETURN_TEXT = "{T}: Return a card you own exiled with this artifact to your hand.";
const LOSE_TEXT = "When you lose control of this artifact, put all cards exiled with this artifact into their owner's graveyard.";

export default defineCard({
  name: "Gustha's Scepter",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${RETURN_TEXT}\n${LOSE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      resolve: null,
      text: EXILE_TEXT,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 1,
        max: 1,
        destination: "exile-face-down",
        leftover: "stay",
        faceDownLooks: "chooser",
      },
    },
    {
      cost: { mana: null, tap: true },
      resolve: null,
      text: RETURN_TEXT,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { ownedBy: "you" },
        destination: "hand",
        leftover: "stay",
      },
    },
  ],
  triggered: [
    {
      trigger: { on: "loses-control", who: "self" },
      resolve: null,
      text: LOSE_TEXT,
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "graveyard" },
    },
  ],
});
