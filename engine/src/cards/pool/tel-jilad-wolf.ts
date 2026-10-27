import { defineCard } from "../define.js";

// EDHREC rank 31033.

export default defineCard({
  name: "Tel-Jilad Wolf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature becomes blocked by an artifact creature, this creature gets +3/+3 until end of turn.",
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { types: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature becomes blocked by an artifact creature, this creature gets +3/+3 until end of turn.",
    },
  ],
});
