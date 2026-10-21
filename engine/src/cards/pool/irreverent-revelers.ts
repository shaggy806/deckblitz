import { defineCard } from "../define.js";

const TRIGGER_TEXT = "When this creature enters, choose one —\n• Destroy target artifact.\n• This creature gains haste until end of turn.";

export default defineCard({
  name: "Irreverent Revelers",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr"],
  power: 2,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Destroy target artifact.", targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
          {
            text: "This creature gains haste until end of turn.",
            effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
