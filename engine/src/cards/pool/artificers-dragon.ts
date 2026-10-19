import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 18731. The Brothers' War.
// Rulings:
//   The first activated ability affects only artifact creatures you control at the time it
//   resolves. Any artifact creatures that come under your control later in the turn won't be
//   affected.

const PUMP_TEXT = "{R}: Artifact creatures you control get +1/+0 until end of turn.";
const UNEARTH_TEXT =
  "Unearth {3}{R}{R} ({3}{R}{R}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)";

export default defineCard({
  name: "Artificer's Dragon",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}\n${UNEARTH_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { types: ["artifact", "creature"], controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
    unearth("{3}{R}{R}"),
  ],
});
