import { defineCard } from "../define.js";

// The card is chosen as the trigger resolves (Aphemia herself, if she died
// in response — the ruling), and only one: one Zombie (Master Skald's shape).
const END_TEXT =
  "At the beginning of your end step, you may exile an enchantment card from your graveyard. If you do, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Aphemia, the Cacophony",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Harpy"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile an enchantment card from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              filter: { type: "enchantment" },
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "create-token", token: "Zombie Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
