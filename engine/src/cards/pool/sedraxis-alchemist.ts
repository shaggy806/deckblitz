import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, if you control a blue permanent, return target nonland permanent to its owner's hand.";

export default defineCard({
  name: "Sedraxis Alchemist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Intervening if (rule 603.4): checked as it triggers and as it resolves.
      condition: { kind: "controls", filter: { colors: ["U"] }, atLeast: 1 },
      targets: ["nonland-permanent"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
