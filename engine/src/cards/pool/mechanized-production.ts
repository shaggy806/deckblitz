import { defineCard } from "../define.js";

// EDHREC rank 989.
//
// Followed Footsteps' copy, the token its controller's (rule 111.2), read as
// the trigger resolves. The eight are read after the token is made, and needn't
// be namesakes of the enchanted artifact; only artifacts count (the rulings).
// Whatever the token's arrival triggers waits until this has finished (the
// rulings; rule 603.3).

const TEXT =
  "At the beginning of your upkeep, create a token that's a copy of enchanted artifact. Then if you control eight or more artifacts with the same name as one another, you win the game.";

export default defineCard({
  name: "Mechanized Production",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact you control\n${TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token-copy", of: "enchanted", count: 1, who: "you" },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 8, sharingAName: true },
            then: { kind: "win-game" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
