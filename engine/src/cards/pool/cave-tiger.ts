import { defineCard } from "../define.js";

// EDHREC rank 29974. Once per blocking creature (rule 509.3d's "becomes
// blocked by a creature" — Pygmy Troll's shape).

const TEXT = "Whenever this creature becomes blocked by a creature, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Cave Tiger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
