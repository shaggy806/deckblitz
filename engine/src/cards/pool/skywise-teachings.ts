import { defineCard } from "../define.js";

// EDHREC rank 21964. {1}{U} at most once per trigger (the ruling).
const CAST_TEXT =
  "Whenever you cast a noncreature spell, you may pay {1}{U}. If you do, create a 2/2 blue Djinn Monk creature token with flying.";

export default defineCard({
  name: "Skywise Teachings",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U} to create a 2/2 blue Djinn Monk creature token with flying?",
        cost: "{1}{U}",
        effect: { kind: "create-token", token: "Djinn Monk Token", count: 1 },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
