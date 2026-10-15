import { defineCard } from "../define.js";

// EDHREC rank 13235.

const MANA_TEXT = "{T}: Add an amount of {G} equal to this creature's power.";

export default defineCard({
  name: "Rainveil Rejuvenator",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Druid"],
  power: 2,
  toughness: 4,
  text: `When this creature enters, you may mill three cards. (You may put the top three cards of your library into your graveyard.)\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { powerOf: "source" } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill three cards?",
        effect: { kind: "mill", target: "you", amount: 3 },
      },
      resolve: null,
      text: "When this creature enters, you may mill three cards.",
    },
  ],
});
