import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, tap target creature. If evidence was collected, put a stun counter on it.";

// "If evidence was collected" (rule 701.59c) is the spell having been cast
// with its collect-evidence additional cost paid — kicked.
export default defineCard({
  name: "Crimestopper Sprite",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Detective"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "", keyword: "collect-evidence", collectEvidence: 6 },
  text: "As an additional cost to cast this spell, you may collect evidence 6. (Exile cards with total mana value 6 or greater from your graveyard.)\nFlying\nWhen this creature enters, tap target creature. If evidence was collected, put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "self-kicked" },
            then: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
