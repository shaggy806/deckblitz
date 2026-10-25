import { defineCard } from "../define.js";

const INSPIRED_TEXT =
  "Inspired — Whenever King Macar becomes untapped, you may exile target creature. If you do, create a Gold token. (It's an artifact with \"Sacrifice this token: Add one mana of any color.\")";

// The target is chosen as the trigger goes on the stack; the "may" is
// decided as it resolves, and the Gold token is King Macar's controller's.
export default defineCard({
  name: "King Macar, the Gold-Cursed",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 3,
  text: INSPIRED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Exile the target creature and create a Gold token?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "create-token", token: "Gold Token", count: 1 },
          ],
        },
      },
      resolve: null,
      text: INSPIRED_TEXT,
    },
  ],
});
