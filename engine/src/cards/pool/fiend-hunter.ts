import { defineCard } from "../define.js";

// EDHREC rank 3916. Faceless Butcher's two linked abilities, with the exile optional.
//
// Rulings:
//   [2018-12-07] If Fiend Hunter leaves the battlefield before its first ability has resolved, its
//     second ability will trigger and do nothing. Then its first ability will resolve and exile
//     the target creature indefinitely.
//   [2018-12-07] If a token is exiled this way, it won't return to the battlefield.

export default defineCard({
  name: "Fiend Hunter",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: "When this creature enters, you may exile another target creature.\nWhen this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Exile the target creature?",
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: "When this creature enters, you may exile another target creature.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.",
    },
  ],
});
