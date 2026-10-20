import { defineCard } from "../define.js";

export default defineCard({
  name: "Big Game Hunter",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Assassin"],
  power: 1,
  toughness: 1,
  madness: { cost: "{B}" },
  text: "When this creature enters, destroy target creature with power 4 or greater. It can't be regenerated.\nMadness {B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "When this creature enters, destroy target creature with power 4 or greater. It can't be regenerated.",
    },
  ],
});
