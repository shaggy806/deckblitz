import { defineCard } from "../define.js";

// EDHREC rank 20971.

export default defineCard({
  name: "Elektra, Femme Fatale",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Hero"],
  power: 3,
  toughness: 2,
  text: "When Elektra enters, you may have her deal 2 damage to you. When you do, she deals 4 damage to target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Elektra deal 2 damage to you?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 2, who: "you" },
            // "When you do" only if the damage was dealt — a prevented hit
            // isn't doing it (rule 603.12).
            {
              kind: "conditional",
              condition: { kind: "damage-dealt-this-way", player: true },
              then: {
                kind: "reflexive-trigger",
                targets: ["creature"],
                effect: { kind: "damage", amount: 4, target: 0 },
                text: "When you do, she deals 4 damage to target creature.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: "When Elektra enters, you may have her deal 2 damage to you. When you do, she deals 4 damage to target creature.",
    },
  ],
});
