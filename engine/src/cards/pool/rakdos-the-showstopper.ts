import { defineCard } from "../define.js";

// Rulings:
//   All of the creatures whose coins come up tails are destroyed at the same time.
//   Players can't take any action between the time that coins are flipped and the time creatures
//     are destroyed.

const TEXT =
  "When Rakdos enters, flip a coin for each creature that isn't a Demon, Devil, or Imp. Destroy each creature whose coin comes up tails.";

export default defineCard({
  name: "Rakdos, the Showstopper",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // One instruction: each creature's coin, and the tails ones destroyed in one event.
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", notSubtypes: ["Demon", "Devil", "Imp"] },
        simultaneous: true,
        effect: { kind: "flip-coin", sides: true, tails: { kind: "destroy", target: 0 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
