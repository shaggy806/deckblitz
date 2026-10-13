import { defineCard } from "../define.js";

// EDHREC rank 7057.
// The Goblin enters attacking a player or planeswalker its controller chooses,
// not necessarily the one the nontoken creature attacks (the ruling), and was
// never declared as an attacker (Den of the Bugbear's shape).
export default defineCard({
  name: "Mardu Ascendancy",
  manaCost: "{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["enchantment"],
  text: "Whenever a nontoken creature you control attacks, create a 1/1 red Goblin creature token that's tapped and attacking.\nSacrifice this enchantment: Creatures you control get +0/+3 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: "Whenever a nontoken creature you control attacks, create a 1/1 red Goblin creature token that's tapped and attacking.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 0,
        toughness: 3,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice this enchantment: Creatures you control get +0/+3 until end of turn.",
    },
  ],
});
