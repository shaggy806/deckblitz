import { defineCard } from "../define.js";

// EDHREC rank 12514. Flesh Burrower's attack grant, on "another target
// Assassin you control".

const ATTACKS = "Whenever this creature attacks, another target Assassin you control gains deathtouch until end of turn.";

export default defineCard({
  name: "Poison-Blade Mentor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Assassin" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
