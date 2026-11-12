import { defineCard } from "../define.js";

// EDHREC rank 11062. X is counted as the ability resolves (the ruling): every
// attacking creature, whoever's.

const ATTACK_TEXT =
  "Whenever Ghost-Spider attacks, she deals X damage to defending player, where X is the number of attacking creatures.";

export default defineCard({
  name: "Ghost-Spider, Gwen Stacy",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "damage", who: "trigger-player", amount: { countOf: { type: "creature", attacking: true } } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
