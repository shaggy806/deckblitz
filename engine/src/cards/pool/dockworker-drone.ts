import { defineCard } from "../define.js";

// EDHREC rank 14699.
//
// Essence Channeler's shape: each kind of counter it had as it died, put on
// rather than moved (rule 122.8, the rulings) — -1/-1 counters too.

export default defineCard({
  name: "Dockworker Drone",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 1,
  toughness: 1,
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
