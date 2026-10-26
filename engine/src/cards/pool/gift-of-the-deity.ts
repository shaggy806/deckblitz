import { defineCard } from "../define.js";

// EDHREC rank 18058. Favor of the Overbeing's two colour-gated statics; the
// green one's Lure clause is a third static under the same condition.
//
// Rulings:
//   [2008-08-01] If the enchanted creature is both of the listed colors, it will get both bonuses.

const BLACK_TEXT =
  "As long as enchanted creature is black, it gets +1/+1 and has deathtouch. (Any amount of damage it deals to a creature is enough to destroy that creature.)";
const GREEN_TEXT = "As long as enchanted creature is green, it gets +1/+1 and all creatures able to block it do so.";

const isGreen = { kind: "source", filter: { attachedTo: { colors: ["G"] } } } as const;

export default defineCard({
  name: "Gift of the Deity",
  manaCost: "{4}{B/G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BLACK_TEXT}\n${GREEN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["B"] } } },
      grantPt: [1, 1],
      grantKeywords: ["deathtouch"],
      text: BLACK_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: isGreen,
      grantPt: [1, 1],
      restrictions: ["must-be-blocked"],
      text: GREEN_TEXT,
    },
  ],
});
