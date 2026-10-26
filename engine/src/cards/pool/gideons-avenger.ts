import { defineCard } from "../define.js";

// EDHREC rank 14544. A creature entering tapped never becomes tapped (its
// ruling): only a tap emits the event this watches.

const TEXT = "Whenever a creature an opponent controls becomes tapped, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Gideon's Avenger",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
