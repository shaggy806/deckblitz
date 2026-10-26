import { defineCard } from "../define.js";

// "It phases out at end of combat": a delayed trigger set up by the attack
// trigger, acting on the attacker (its trigger object) only if it's still that
// creature (rule 400.7). It triggers after combat damage (the ruling), and the
// creature phases in during its controller's next untap step (rule 502.1).

export default defineCard({
  name: "Teferi's Veil",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever a creature you control attacks, it phases out at end of combat. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "phase-out", target: "trigger-object" },
        text: "It phases out.",
      },
      resolve: null,
      text: "Whenever a creature you control attacks, it phases out at end of combat.",
    },
  ],
});
