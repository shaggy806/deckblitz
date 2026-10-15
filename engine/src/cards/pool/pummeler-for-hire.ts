import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 25847.
//
// Rulings:
//   [2025-11-17] The value of X is calculated only once, as Pummeler for Hire's last ability
//     resolves.
//
// "The greatest power among Giants you control" counts this creature too when
// it's still there (a Giant itself), and a changeling; read as it resolves.
const ETB_TEXT = "When this creature enters, you gain X life, where X is the greatest power among Giants you control.";

export default defineCard({
  name: "Pummeler for Hire",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Mercenary"],
  power: 4,
  toughness: 4,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${ETB_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { aggregate: "max", of: "power", filter: { type: "creature", subtype: "Giant", controlledBy: "you" } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
