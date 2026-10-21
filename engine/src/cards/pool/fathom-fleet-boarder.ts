import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you lose 2 life unless you control another Pirate.";

export default defineCard({
  name: "Fathom Fleet Boarder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Always triggers; the other Pirate is checked as it resolves (the ruling).
      effect: {
        kind: "conditional",
        condition: {
          kind: "not",
          of: { kind: "controls", filter: { subtype: "Pirate" }, atLeast: 1, excludeSelf: true },
        },
        then: { kind: "lose-life", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
