import { defineCard } from "../define.js";

const TEXT = "When Will Riker enters, put a +1/+1 counter on another target creature you control.";

export default defineCard({
  name: "Will Riker, Assuming Command",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
