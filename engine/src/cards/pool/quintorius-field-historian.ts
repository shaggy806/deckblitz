import { defineCard } from "../define.js";

// EDHREC rank 9139.
//
// Rulings:
//   [2021-04-16] If two or more cards leave your graveyard as a single event, Quintorius's last
//     ability will trigger once. If they leave your graveyard as separate events, it will trigger
//     once for each event.
//
// `leaves-graveyard` is batched — once per event (the ruling), as Quintorius,
// History Chaser's same trigger.
export default defineCard({
  name: "Quintorius, Field Historian",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 2,
  toughness: 4,
  text: "Spirits you control get +1/+0.\nWhenever one or more cards leave your graveyard, create a 3/2 red and white Spirit creature token.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Spirit", controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Spirits you control get +1/+0.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Red-White)", count: 1 },
      resolve: null,
      text: "Whenever one or more cards leave your graveyard, create a 3/2 red and white Spirit creature token.",
    },
  ],
});
