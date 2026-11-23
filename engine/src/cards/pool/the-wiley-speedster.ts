import { defineCard } from "../define.js";

const MODES = [
  "Target creature gets +1/+0 and gains haste until end of turn.",
  "The Wiley Speedster deals 1 damage to any target.",
  "Create a Treasure token.",
] as const;

export default defineCard({
  name: "The Wiley Speedster",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 2,
  text: `At the beginning of combat on your turn, choose one —\n${MODES.map((m) => `• ${m}`).join("\n")}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: MODES[0],
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
              ],
            },
          },
          { text: MODES[1], targets: ["any-target"], effect: { kind: "damage", amount: 1, target: 0 } },
          { text: MODES[2], effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, choose one —",
    },
  ],
});
