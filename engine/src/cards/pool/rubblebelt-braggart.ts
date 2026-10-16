import { defineCard } from "../define.js";

// An intervening "if" (rule 603.4): it doesn't trigger while it's suspected,
// and does nothing if it has become suspected by the time it resolves.

const TEXT = "Whenever this creature attacks, if it's not suspected, you may suspect it.";

export default defineCard({
  name: "Rubblebelt Braggart",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 5,
  toughness: 5,
  text: `${TEXT} (A suspected creature has menace and can't block.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { suspected: false } },
      targets: [],
      effect: { kind: "may", prompt: "Suspect Rubblebelt Braggart?", effect: { kind: "suspect", target: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
