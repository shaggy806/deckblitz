import { defineCard } from "../define.js";

// EDHREC rank 10006.

export default defineCard({
  name: "Yavimaya Steelcrusher",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ape", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)\n{1}, Sacrifice this creature: Destroy target artifact.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{1}, Sacrifice this creature: Destroy target artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      enlist: true,
      text: "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)",
    },
  ],
});
