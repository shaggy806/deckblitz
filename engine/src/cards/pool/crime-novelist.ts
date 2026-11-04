import { defineCard } from "../define.js";

// Not a mana ability: a triggered ability is one only if it triggers from a
// mana ability or from mana being added (rules 605.1b, 605.5a). A sacrifice is
// neither, so this uses the stack, like Lotus Cobra's, and the {R} comes as it
// resolves.

const TEXT = "Whenever you sacrifice an artifact, put a +1/+1 counter on this creature and add {R}.";

export default defineCard({
  name: "Crime Novelist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Bard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "add-mana", mana: "R", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
