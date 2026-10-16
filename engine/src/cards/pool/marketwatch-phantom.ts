import { defineCard } from "../define.js";

// The entering creature's power is checked as it enters, counters it enters
// with included; growing afterwards doesn't stop the trigger (the ruling).

const TEXT = "Whenever another creature you control with power 2 or less enters, this creature gains flying until end of turn.";

export default defineCard({
  name: "Marketwatch Phantom",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Detective"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
