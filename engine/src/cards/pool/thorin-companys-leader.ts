import { defineCard } from "../define.js";

// EDHREC rank 12883. Its ruling: once for each Dwarf that deals the damage.

export default defineCard({
  name: "Thorin, Company's Leader",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 4,
  toughness: 5,
  text: "Whenever a Dwarf you control deals combat damage to a player or battle, create two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")\n{10}: Creatures you control gain double strike until end of turn.",
  activated: [
    {
      cost: { mana: "{10}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "double-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{10}: Creatures you control gain double strike until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Dwarf" }, orBattle: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2 },
      resolve: null,
      text: "Whenever a Dwarf you control deals combat damage to a player or battle, create two Treasure tokens.",
    },
  ],
});
