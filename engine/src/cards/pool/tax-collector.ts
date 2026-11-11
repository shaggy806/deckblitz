import { defineCard } from "../define.js";

// EDHREC rank 8656. Tax is a timed static lasting until your next turn, as
// Elspeth Conquers Death's chapter II is; Arrest is detain (rule 701.35).
const TEXT =
  "When this creature enters, choose one —\n• Tax — Until your next turn, spells your opponents cast cost {1} more to cast.\n• Arrest — Detain target creature an opponent controls. (Until your next turn, that creature can't attack or block and its activated abilities can't be activated.)";

export default defineCard({
  name: "Tax Collector",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 2,
  text: TEXT,
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
          {
            text: "Tax — Until your next turn, spells your opponents cast cost {1} more to cast.",
            effect: {
              kind: "timed-static",
              duration: "until-your-next-turn",
              text: "Until your next turn, spells your opponents cast cost {1} more to cast.",
              static: [
                {
                  affects: { scope: "self" },
                  costModification: { applies: {}, increaseGeneric: 1, when: { caster: "opponent" } },
                  text: "Spells your opponents cast cost {1} more to cast.",
                },
              ],
            },
          },
          {
            text: "Arrest — Detain target creature an opponent controls.",
            targets: ["creature-an-opponent-controls"],
            effect: { kind: "detain", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
