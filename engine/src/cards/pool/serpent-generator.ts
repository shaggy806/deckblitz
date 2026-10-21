import { defineCard } from "../define.js";

// Legends. EDHREC rank 23893.
const TEXT =
  "{4}, {T}: Create a 1/1 colorless Snake artifact creature token. It has \"Whenever this creature deals damage to a player, that player gets a poison counter.\"";

export default defineCard({
  name: "Serpent Generator",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (A player with ten or more poison counters loses the game.)`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Snake Token (artifact, poison)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
