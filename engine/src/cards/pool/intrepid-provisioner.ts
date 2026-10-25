import { defineCard } from "../define.js";

const TEXT = "When this creature enters, another target Human you control gets +2/+2 until end of turn.";

// Patagia Tiger's target, less this creature (itself a Human).
export default defineCard({
  name: "Intrepid Provisioner",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Human" } } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
