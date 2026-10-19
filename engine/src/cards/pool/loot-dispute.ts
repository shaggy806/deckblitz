import { defineCard } from "../define.js";

// EDHREC rank 11264.

export default defineCard({
  name: "Loot Dispute",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "When this enchantment enters, you take the initiative and create a Treasure token.\nWhenever you attack the player who has the initiative, create a Treasure token.\nLoud Ruckus — Whenever you complete a dungeon, create a 5/5 red Dragon creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "take-initiative" }, { kind: "create-token", token: "Treasure Token", count: 1 }],
      },
      resolve: null,
      text: "When this enchantment enters, you take the initiative and create a Treasure token.",
    },
    {
      trigger: { on: "attacks-player", who: "you", defender: "opponent", defenderHasInitiative: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "Whenever you attack the player who has the initiative, create a Treasure token.",
    },
    {
      trigger: { on: "completes-dungeon", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token", count: 1 },
      resolve: null,
      text: "Loud Ruckus — Whenever you complete a dungeon, create a 5/5 red Dragon creature token with flying.",
    },
  ],
});
