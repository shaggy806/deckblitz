import { defineCard } from "../define.js";

// EDHREC rank 8994.
//
// Rulings:
//   [2021-09-24] The controller of the enchanted creature creates the Human token, even if they
//     aren't the controller of Cathar's Call.
//
// The granted trigger is the enchanted creature's own ability, so "your" end
// step and the token are its controller's (Clawing Torment's shape).

const END_TEXT = "At the beginning of your end step, create a 1/1 white Human creature token.";
const GRANT_TEXT = `Enchanted creature has vigilance and "${END_TEXT}"`;

export default defineCard({
  name: "Cathar's Call",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["vigilance"],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          targets: [],
          effect: { kind: "create-token", token: "Human Token", count: 1 },
          resolve: null,
          text: END_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
