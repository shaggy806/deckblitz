import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 27530. Levitating Statue's shape, X/X.
//
// Rulings:
//   If Chimeric Staff is already an artifact creature when you activate its ability, it stays an
//     artifact creature but the ability resets its creature types; the newer X/X applies before
//     counters and other P/T changes (layer 7b). Damage dealt to it stays.

const TEXT = "{X}: This artifact becomes an X/X Construct artifact creature until end of turn.";

export default defineCard({
  name: "Chimeric Staff",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: "x",
        toughness: "x",
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Construct"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
