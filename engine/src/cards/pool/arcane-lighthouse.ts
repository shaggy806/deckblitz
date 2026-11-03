import { defineCard } from "../define.js";

// The effect reaches the creatures opponents control as it resolves (rule
// 611.2c): one entering later isn't affected. On those it reached a static
// grant waits out the turn, and a resolving grant isn't created (the rulings).

const LOSE_TEXT =
  "{1}, {T}: Until end of turn, creatures your opponents control lose hexproof and shroud and can't have hexproof or shroud.";

export default defineCard({
  name: "Arcane Lighthouse",
  types: ["land"],
  text: `{T}: Add {C}.\n${LOSE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "lose-keywords",
        filter: { type: "creature", controlledBy: "opponent" },
        keywords: ["hexproof", "shroud"],
        cantHave: true,
        duration: "end-of-turn",
      },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
});
