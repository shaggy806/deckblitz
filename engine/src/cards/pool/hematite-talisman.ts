import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 25577. Iron Star's trigger, with the target
// chosen as it goes on the stack and the {3} paid as it resolves.

const TEXT = "Whenever a player casts a red spell, you may pay {3}. If you do, untap target permanent.";

export default defineCard({
  name: "Hematite Talisman",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["R"] } },
      targets: ["permanent"],
      effect: { kind: "may", prompt: "Pay {3} to untap the target permanent?", cost: "{3}", effect: { kind: "untap", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
