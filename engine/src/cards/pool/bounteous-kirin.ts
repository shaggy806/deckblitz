import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). The spell's mana value includes the X it was
// cast with (rule 202.3e; the ruling).
const TEXT = "Whenever you cast a Spirit or Arcane spell, you may gain life equal to that spell's mana value.";

export default defineCard({
  name: "Bounteous Kirin",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kirin", "Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Gain life equal to that spell's mana value?",
        effect: { kind: "gain-life", amount: { manaValueOf: "trigger-object" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
