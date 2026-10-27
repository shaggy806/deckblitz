import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 10224. "Goblin creatures" is every player's.

export default defineCard({
  name: "Goblin Lookout",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 2,
  text: "{T}, Sacrifice a Goblin: Goblin creatures get +2/+0 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Goblin" } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Goblin" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}, Sacrifice a Goblin: Goblin creatures get +2/+0 until end of turn.",
    },
  ],
});
