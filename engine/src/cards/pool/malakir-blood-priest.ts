import { defineCard } from "../define.js";

// Party (rule 700.8), counted once as the trigger resolves: both halves use
// the same X.
export default defineCard({
  name: "Malakir Blood-Priest",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, each opponent loses X life and you gain X life, where X is the number of creatures in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { partySize: "you" }, who: "each-opponent" },
          { kind: "gain-life", amount: { partySize: "you" } },
        ],
      },
      resolve: null,
      text: "When this creature enters, each opponent loses X life and you gain X life, where X is the number of creatures in your party.",
    },
  ],
});
