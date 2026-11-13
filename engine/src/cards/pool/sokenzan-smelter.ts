import { defineCard } from "../define.js";

// EDHREC rank 19269. Neon Dynasty. "You may pay {1} and sacrifice an
// artifact" is one `may` with both costs (Killer Service).
const TEXT =
  "At the beginning of combat on your turn, you may pay {1} and sacrifice an artifact. If you do, create a 3/1 red Construct artifact creature token with haste.";

export default defineCard({
  name: "Sokenzan Smelter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} and sacrifice an artifact?",
        cost: "{1}",
        costSacrifice: { filter: { type: "artifact" } },
        effect: { kind: "create-token", token: "Construct Token (3/1 Haste)", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
