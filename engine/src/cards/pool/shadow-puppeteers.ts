import { defineCard } from "../define.js";

// EDHREC rank 6154. A creature no longer a creature as it resolves becomes only
// red: no Dragon type, no base P/T (the ruling).

const ATTACK_TEXT =
  "Whenever a creature you control with flying attacks, you may have it become a red Dragon with base power and toughness 4/4 in addition to its other colors and types until end of turn.";

export default defineCard({
  name: "Shadow Puppeteers",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying, ward {2}\nWhen this creature enters, create two 1/1 black Faerie Rogue creature tokens with flying.\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Faerie Rogue Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 black Faerie Rogue creature tokens with flying.",
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", keyword: "flying" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have it become a red Dragon with base power and toughness 4/4 until end of turn?",
        effect: {
          kind: "conditional",
          condition: { kind: "trigger-object", filter: { type: "creature" } },
          then: {
            kind: "animate",
            target: "trigger-object",
            power: 4,
            toughness: 4,
            addTypes: [],
            addSubtypes: ["Dragon"],
            addColors: ["R"],
            duration: "end-of-turn",
          },
          else: { kind: "become-color", target: "trigger-object", colors: ["R"], inAddition: true, duration: "end-of-turn" },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
