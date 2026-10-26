import { defineCard } from "../define.js";

export default defineCard({
  name: "Weirding Shaman",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 1,
  text: "{3}{B}, Sacrifice a Goblin: Create two 1/1 black Goblin Rogue creature tokens.",
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, sacrifice: { filter: { subtype: "Goblin" } } },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Rogue Token", count: 2 },
      resolve: null,
      text: "{3}{B}, Sacrifice a Goblin: Create two 1/1 black Goblin Rogue creature tokens.",
    },
  ],
});
