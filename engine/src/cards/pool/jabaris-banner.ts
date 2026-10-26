import { defineCard } from "../define.js";
import { flanking } from "../helpers.js";

const TEXT =
  "{1}, {T}: Target creature gains flanking until end of turn. (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)";

export default defineCard({
  name: "Jabari's Banner",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      // Flanking is a triggered ability (rule 702.25a) and the keyword other
      // flanking asks about: both, until end of turn.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flanking", duration: "end-of-turn" },
          { kind: "grant-triggered", target: 0, ability: flanking(), duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{1}, {T}: Target creature gains flanking until end of turn.",
    },
  ],
});
