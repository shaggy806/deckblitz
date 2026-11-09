import { defineCard } from "../define.js";

// EDHREC rank 9129.
//
// Rulings:
//   [2023-11-10] Effects that modify the power of Belligerent Yearling without setting it to a
//     specific value will apply to the new base power no matter when they started to take effect.
//   [2023-11-10] Belligerent Yearling's ability overwrites any previous effects that set its
//     power, including previous instances of that ability.
//
// Base power alone (`become` with `power` and no `toughness`, rule
// 613.4b), the entering Dinosaur's power read as the trigger resolves.
const TEXT =
  "Whenever another Dinosaur you control enters, you may have this creature's base power become equal to that creature's power until end of turn.";

export default defineCard({
  name: "Belligerent Yearling",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { subtype: "Dinosaur" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Belligerent Yearling's base power become that creature's power until end of turn?",
        effect: {
          kind: "become",
          target: "source",
          power: { powerOf: "trigger-object" },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
