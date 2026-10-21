import { defineCard } from "../define.js";

// An intervening-if (rule 603.4), checked as it attacks and again as it
// resolves — not necessarily the same creature (the rulings). A triggered
// ability's `controls` counts the source, so a Dilophosaur pumped to 4 power
// enables itself.

const TEXT =
  "Whenever this creature attacks, if you control a creature with power 4 or greater, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Ornery Dilophosaur",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
