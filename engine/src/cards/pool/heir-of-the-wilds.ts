import { defineCard } from "../define.js";

// EDHREC rank 16785.
// An intervening "if" (the ruling): checked as it attacks and again as the
// trigger resolves — Ornery Dilophosaur's shape.
const FEROCIOUS_TEXT =
  "Ferocious — Whenever this creature attacks, if you control a creature with power 4 or greater, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Heir of the Wilds",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${FEROCIOUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: FEROCIOUS_TEXT,
    },
  ],
});
