import { defineCard } from "../define.js";

// EDHREC rank 15351.
//
// The "when you do" is reflexive (the ruling): the target is chosen once the
// {G/W} is paid. X is the life gained by the triggering event, which the
// reflexive ability carries from the trigger that made it.

const ATTACK_TEXT = "Whenever Hurska attacks, create a Food token.";
const LIFE_TEXT =
  "Whenever you gain life, you may pay {G/W}. When you do, target creature gets +X/+X until end of turn, where X is the amount of life you gained.";

export default defineCard({
  name: "Hurska Sweet-Tooth",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT} (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G/W} to give target creature +X/+X until end of turn?",
        cost: "{G/W}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: {
            kind: "modify-pt",
            target: 0,
            power: { triggerValue: true },
            toughness: { triggerValue: true },
            duration: "end-of-turn",
          },
          text: "When you do, target creature gets +X/+X until end of turn, where X is the amount of life you gained.",
        },
      },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
