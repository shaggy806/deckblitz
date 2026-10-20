import { defineCard } from "../define.js";

// EDHREC rank 16618.

export default defineCard({
  name: "Star Pupil",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 0,
  text: "This creature enters with a +1/+1 counter on it.\nWhen this creature dies, put its counters on target creature you control.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: "When this creature dies, put its counters on target creature you control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});
