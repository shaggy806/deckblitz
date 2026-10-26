import { defineCard } from "../define.js";

// EDHREC rank 21431.
//
// Rulings:
//   [2011-06-01] You’ll choose the target creature when the ability goes on the stack. You’ll
//     choose whether or not to sacrifice Blind Zealot when the ability resolves.
//
// Necrite's shape (the target chosen as it triggers, the sacrifice a "may" as
// it resolves), with Throat Slitter's "creature that player controls".

const TEXT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. If you do, destroy target creature that player controls.";

export default defineCard({
  name: "Blind Zealot",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["intimidate"],
  text: `Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Sacrifice Blind Zealot to destroy the targeted creature?",
        effect: { kind: "sacrifice-source", then: { kind: "destroy", target: 0 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
