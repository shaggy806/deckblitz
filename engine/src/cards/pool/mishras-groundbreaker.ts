import { defineCard } from "../define.js";

// EDHREC rank 29362. Alliances. The effect has no duration (the ruling).

export default defineCard({
  name: "Mishra's Groundbreaker",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{T}, Sacrifice this artifact: Target land becomes a 3/3 artifact creature that's still a land. (This effect lasts indefinitely.)",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["land"],
      effect: {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "permanent",
      },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Target land becomes a 3/3 artifact creature that's still a land.",
    },
  ],
});
