import { defineCard } from "../define.js";

// EDHREC rank 23631.

export default defineCard({
  name: "Spiteful Squad",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 0,
  toughness: 0,
  keywords: ["deathtouch"],
  text: "Deathtouch\nThis creature enters with two +1/+1 counters on it.\nWhen this creature dies, put its counters on target creature you control.",
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
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
});
