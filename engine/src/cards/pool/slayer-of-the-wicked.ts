import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you may destroy target Vampire, Werewolf, or Zombie.";

// The target is chosen as the trigger goes on the stack (one is required when
// one exists — its ruling); whether to destroy it is chosen on resolution.
export default defineCard({
  name: "Slayer of the Wicked",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtypes: ["Vampire", "Werewolf", "Zombie"] } }],
      effect: {
        kind: "may",
        prompt: "Destroy the targeted Vampire, Werewolf, or Zombie?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
