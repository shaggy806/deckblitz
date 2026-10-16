import { defineCard } from "../define.js";

// EDHREC rank 14718. Moon-Boy's "attacks while you control …": part of the
// trigger condition, so losing the token before it resolves doesn't matter
// (the ruling). Counting the source, so a token copy of it counts itself.
const TEXT = "Whenever this creature attacks while you control a token, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Seasoned Warrenguard",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rabbit", "Warrior"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { token: true }, atLeast: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
