import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 18114.
//
// Fourth Bridge Prowler's shape on a landfall trigger: the target is chosen
// as it triggers, the "may" asked as it resolves.
const TEXT = "Landfall — Whenever a land you control enters, you may have target creature get -1/-1 until end of turn.";

export default defineCard({
  name: "Caustic Crawler",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get -1/-1 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
