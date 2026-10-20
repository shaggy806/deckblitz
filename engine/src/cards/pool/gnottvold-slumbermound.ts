import { defineCard } from "../define.js";

// EDHREC rank 18141. Kaldheim.
//
// Rulings:
//   [2021-02-05] If the target land is an illegal target by the time the last activated ability
//     tries to resolve, the ability won’t resolve and none of its effects will happen. You won’t
//     create a Troll Warrior creature token.

export default defineCard({
  name: "Gnottvold Slumbermound",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {R}.\n{3}{R}{G}{G}, {T}, Sacrifice this land: Destroy target land. Create a 4/4 green Troll Warrior creature token with trample.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{3}{R}{G}{G}", tap: true, sacrifice: "self" },
      targets: ["land"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "create-token", token: "Troll Warrior Token", count: 1 },
        ],
      },
      resolve: null,
      text: "{3}{R}{G}{G}, {T}, Sacrifice this land: Destroy target land. Create a 4/4 green Troll Warrior creature token with trample.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
