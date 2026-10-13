import { defineCard } from "../define.js";

// EDHREC rank 5017. Phased out (rule 702.26b) until your next untap step.
const TEXT =
  "{2}, {T}: Target creature you control phases out. (Treat it and anything attached to it as though they don't exist until your next turn.)";

export default defineCard({
  name: "Haystack",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "phase-out", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
