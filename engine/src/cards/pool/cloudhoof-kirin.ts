import { defineCard } from "../define.js";

// Saviors of Kamigawa. "That spell's mana value" is the trigger object's, X
// included as it was on the stack (its ruling).
const TEXT =
  "Whenever you cast a Spirit or Arcane spell, you may have target player mill X cards, where X is that spell's mana value.";

export default defineCard({
  name: "Cloudhoof Kirin",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kirin", "Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Spirit", "Arcane"] } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player mill cards equal to that spell's mana value?",
        effect: { kind: "mill", target: 0, amount: { manaValueOf: "trigger-object" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
