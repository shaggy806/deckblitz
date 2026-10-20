import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 12954.
//
// The mode is announced as the trigger goes on the stack; "that Vehicle" is the attacker
// that fired it.
const TEXT =
  "Whenever a Vehicle you control attacks, choose one —\n• That Vehicle gains first strike until end of turn.\n• Untap this creature.";

export default defineCard({
  name: "Kitsune Ace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Pilot"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "That Vehicle gains first strike until end of turn.",
            effect: {
              kind: "grant-keyword",
              target: "trigger-object",
              keyword: "first-strike",
              duration: "end-of-turn",
            },
          },
          {
            text: "Untap this creature.",
            effect: { kind: "untap", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
