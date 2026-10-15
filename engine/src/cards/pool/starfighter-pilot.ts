import { defineCard } from "../define.js";

// EDHREC rank 17804. Chrome Companion's trigger.

const TAPPED_TEXT = "Whenever this creature becomes tapped, surveil 1.";

export default defineCard({
  name: "Starfighter Pilot",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 2,
  text: `${TAPPED_TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
});
