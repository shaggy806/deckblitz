import { defineCard } from "../define.js";

// EDHREC rank 22649.

const ENTERS = "When this creature enters, it deals 3 damage to each other creature.";

export default defineCard({
  name: "Chaos Maw",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 6,
  toughness: 6,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 3, exceptSource: true },
      resolve: null,
      text: ENTERS,
    },
  ],
});
