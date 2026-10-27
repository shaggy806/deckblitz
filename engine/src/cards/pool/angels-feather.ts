import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 10023. Kor Firewalker's trigger, for white: any
// player's white spell (the rulings).

const TEXT = "Whenever a player casts a white spell, you may gain 1 life.";

export default defineCard({
  name: "Angel's Feather",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
