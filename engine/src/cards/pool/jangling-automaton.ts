import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, untap all creatures defending player controls.";

export default defineCard({
  name: "Jangling Automaton",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // The defending player's creatures, read from that player's side.
      effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" }, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
