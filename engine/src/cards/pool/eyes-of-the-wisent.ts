import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 22990. Kindred (formerly tribal) — Elemental.
// "During your turn" is part of the trigger condition (Witchstalker's shape).
const TEXT =
  "Whenever an opponent casts a blue spell during your turn, you may create a 4/4 green Elemental creature token.";

export default defineCard({
  name: "Eyes of the Wisent",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["kindred", "enchantment"],
  subtypes: ["Elemental"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { colors: ["U"] } },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 4/4 green Elemental creature token?",
        effect: { kind: "create-token", token: "4/4 Green Elemental Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
