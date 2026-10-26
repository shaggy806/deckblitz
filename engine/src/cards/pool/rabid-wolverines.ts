import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 31449.
//
// Once per blocking creature (Kolaghan Aspirant's trigger).

const TEXT = "Whenever this creature becomes blocked by a creature, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Rabid Wolverines",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolverine"],
  power: 4,
  toughness: 4,
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
