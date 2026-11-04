import { defineCard } from "../define.js";

// The spell is cast as the trigger resolves, from among the five cards milled and no
// others in that graveyard; its caster controls it, and its owner still owns it (rule
// 108.3).
const ENTERS_TEXT =
  "When this creature enters, target opponent mills five cards. You may cast an instant or sorcery spell from among them without paying its mana cost.";

export default defineCard({
  name: "Jace's Mindseeker",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish", "Illusion"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 5 },
          { kind: "cast-now", from: "milled-this-way", spell: { typesAnyOf: ["instant", "sorcery"] }, free: true },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
