import { defineCard } from "../define.js";

// EDHREC rank 8149.
//
// Rulings:
//   [2025-06-06] You can't use Beatrix's last ability to try to attach an Equipment to a creature
//     if that Equipment can't legally be attached to that creature.

export default defineCard({
  name: "Beatrix, Loyal General",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\nAt the beginning of combat on your turn, you may attach any number of Equipment you control to target creature you control.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      // "Any number" includes none. One that can't legally equip it doesn't
      // move (rule 701.3b — the ruling: it can't be attached).
      effect: {
        kind: "attach",
        target: 0,
        choose: {
          filter: { subtype: "Equipment", controlledBy: "you" },
          prompt: "Attach any number of Equipment you control",
        },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, you may attach any number of Equipment you control to target creature you control.",
    },
  ],
});
