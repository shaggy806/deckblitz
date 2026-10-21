import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] You choose which player or planeswalker the Bird token is attacking. It doesn't
//     have to be attacking the same player or planeswalker that Falconer Adept is attacking.
//   [2020-06-23] Although the Bird is an attacking creature, it was never declared as an attacking
//     creature.

export default defineCard({
  name: "Falconer Adept",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Whenever this creature attacks, create a 1/1 white Bird creature token with flying that's tapped and attacking.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: "Whenever this creature attacks, create a 1/1 white Bird creature token with flying that's tapped and attacking.",
    },
  ],
});
