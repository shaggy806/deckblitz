import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// EDHREC rank 17629.

export default defineCard({
  name: "Nagao, Bound by Honor",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  text: "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\nWhenever Nagao attacks, Samurai creatures you control get +1/+1 until end of turn.",
  triggered: [
    ...bushido(1),
    {
      // Dauntless Veteran's, over Samurai.
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Samurai", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever Nagao attacks, Samurai creatures you control get +1/+1 until end of turn.",
    },
  ],
});
