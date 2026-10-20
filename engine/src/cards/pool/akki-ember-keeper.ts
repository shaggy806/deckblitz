import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 18475.
// Makes Spirit → "Spirit Token (Colorless)".
//
// "Modified" (rule 700.9) is read off the creature as it last existed on the battlefield: a
// counter, an Equipment (anyone's) or an Aura its controller controlled.
const TEXT =
  "Whenever a nontoken modified creature you control dies, create a 1/1 colorless Spirit creature token.";

export default defineCard({
  name: "Akki Ember-Keeper",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", token: false, modified: true },
      },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
