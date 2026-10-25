import { defineCard } from "../define.js";

// The power comparison is the target's legality, so it's checked as the
// ability goes on the stack and again as it resolves (the ruling).

const TEXT =
  "At the beginning of combat on your turn, you may pay {1}{U/R}{U/R}. If you do, gain control of target creature an opponent controls with power less than Yasova Dragonclaw's power until end of turn, untap that creature, and it gains haste until end of turn.";

export default defineCard({
  name: "Yasova Dragonclaw",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", controlledBy: "opponent", power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U/R}{U/R} to gain control of that creature until end of turn?",
        cost: "{1}{U/R}{U/R}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 0, untilEndOfTurn: true },
            { kind: "untap", target: 0 },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
