import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 25720.

const TEXT = "Whenever a player casts a black spell, you may pay {3}. If you do, untap target permanent.";

export default defineCard({
  name: "Onyx Talisman",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["B"] } },
      targets: ["permanent"],
      effect: {
        kind: "may",
        prompt: "Pay {3} to untap the targeted permanent?",
        cost: "{3}",
        effect: { kind: "untap", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
