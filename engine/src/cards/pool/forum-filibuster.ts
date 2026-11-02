import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, create a 2/1 white and black Inkling creature token with flying. When you do, return up to one target Aura or Equipment card from your graveyard to the battlefield attached to that token.";

export default defineCard({
  name: "Forum Filibuster",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Inkling Token", count: 1 },
          {
            kind: "reflexive-trigger",
            about: "created",
            targets: [
              {
                kind: "optional",
                of: { kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } },
              },
            ],
            effect: { kind: "put-onto-battlefield", target: 0, attachedTo: "trigger-object" },
            text: "When you do, return up to one target Aura or Equipment card from your graveyard to the battlefield attached to that token.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
