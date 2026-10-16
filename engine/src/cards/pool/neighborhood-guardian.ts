import { defineCard } from "../define.js";

const TEXT =
  "Whenever another creature you control with power 2 or less enters, target creature you control gets +1/+1 until end of turn.";

export default defineCard({
  name: "Neighborhood Guardian",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      // The power is checked only as it enters, counters it enters with
      // included (the ruling).
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        otherOnly: true,
      },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
