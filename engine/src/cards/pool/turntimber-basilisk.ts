import { defineCard } from "../define.js";

// EDHREC rank 15941. Caustic Crawler's landfall "may" over a
// `block-if-able` requirement naming this creature; the choice is made as the
// trigger resolves (the ruling).

const LANDFALL =
  "Landfall — Whenever a land you control enters, you may have target creature block this creature this turn if able.";

export default defineCard({
  name: "Turntimber Basilisk",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Basilisk"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${LANDFALL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature block this creature this turn if able?",
        effect: { kind: "block-if-able", target: 0, attacker: "source" },
      },
      resolve: null,
      text: LANDFALL,
    },
  ],
});
