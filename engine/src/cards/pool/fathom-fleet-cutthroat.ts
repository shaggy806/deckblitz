import { defineCard } from "../define.js";

// EDHREC rank 25880. Rooftop Assassin's enters trigger.

const TEXT = "When this creature enters, destroy target creature an opponent controls that was dealt damage this turn.";

export default defineCard({
  name: "Fathom Fleet Cutthroat",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
