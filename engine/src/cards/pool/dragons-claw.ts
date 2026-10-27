import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 14056. Kor Firewalker's trigger: any player's red
// spell (the rulings).

const TEXT = "Whenever a player casts a red spell, you may gain 1 life.";

export default defineCard({
  name: "Dragon's Claw",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
