import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Ant-Man, Colony Commander's "you may pay ….
// When you do, …": the reflexive trigger's target is chosen as it goes on
// the stack, after the {2}{W} is paid (the ruling; rule 603.12).

const TEXT = "Whenever this creature attacks, you may pay {2}{W}. When you do, tap target creature.";

export default defineCard({
  name: "Thousand Moons Crackshot",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{W} to tap target creature?",
        cost: "{2}{W}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "tap", target: 0 },
          text: "When you do, tap target creature.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
