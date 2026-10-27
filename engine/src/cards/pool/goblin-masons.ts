import { defineCard } from "../define.js";

// EDHREC rank 31290. With no Wall to target, the
// trigger is removed from the stack (its ruling).

const TEXT = "When this creature dies, destroy target Wall.";

export default defineCard({
  name: "Goblin Masons",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
      resolve: null,
      effect: { kind: "destroy", target: 0 },
      text: TEXT,
    },
  ],
});
