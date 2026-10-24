import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 15548.
//
// Rally (`thisOrAnother`). Vigilance granted after attackers are declared
// doesn't untap anything (the ruling) — the keyword only matters then.
const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, creatures you control gain vigilance until end of turn.";

export default defineCard({
  name: "Makindi Patrol",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight", "Ally"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "vigilance",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
