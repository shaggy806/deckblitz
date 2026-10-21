import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "When this creature enters, surveil 4. When you do, you may return target nonland permanent an opponent controls to its owner's hand.";
const REFLEXIVE_TEXT = "When you do, you may return target nonland permanent an opponent controls to its owner's hand.";

export default defineCard({
  name: "Dream Eater",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Sphinx"],
  power: 4,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TRIGGER_TEXT} (To surveil 4, look at the top four cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // The ability has no target; the reflexive one triggers after the
      // surveil, even with fewer than four cards to look at (the rulings),
      // and picks its target then.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 4 },
          {
            kind: "reflexive-trigger",
            targets: ["nonland-permanent-an-opponent-controls"],
            effect: {
              kind: "may",
              prompt: "Return target nonland permanent an opponent controls to its owner's hand?",
              effect: { kind: "return-to-hand", target: 0 },
            },
            text: REFLEXIVE_TEXT,
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
