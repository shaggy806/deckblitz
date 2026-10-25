import { defineCard } from "../define.js";

// Mirage. EDHREC rank 20154.

export default defineCard({
  name: "Goblin Soothsayer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: "{R}, {T}, Sacrifice a Goblin: Red creatures get +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: true, sacrifice: { filter: { subtype: "Goblin" } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", colors: ["R"] },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}, {T}, Sacrifice a Goblin: Red creatures get +1/+1 until end of turn.",
    },
  ],
});
