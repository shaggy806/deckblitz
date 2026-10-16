import { defineCard } from "../define.js";

// EDHREC rank 21713. Ascendant Dustspeaker's shape.

const ENTERS = "When this creature enters, put a +1/+1 counter on another target creature you control.";

export default defineCard({
  name: "Keen-Eyed Raven",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
