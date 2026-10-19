import { defineCard } from "../define.js";

// Streets of New Capenna Commander.
//
// Rulings:
//   [2022-04-29] To double a creature's power, that creature gets +X/+0, where X is that
//     creature's power as Mr. Orfeo's triggered ability resolves.
//
// Rev, Tithe Extractor's "whenever you attack" with Bulk Up's doubling.
const TEXT = "Whenever you attack, double target creature's power until end of turn.";

export default defineCard({
  name: "Mr. Orfeo, the Boulder",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rhino", "Warrior"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: 0, doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
