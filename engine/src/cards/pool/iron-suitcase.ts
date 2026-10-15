import { defineCard } from "../define.js";

// EDHREC rank 23513.
// The Mechanist's animation, on itself: a 3/3 Construct artifact creature
// with flying until end of turn (it was an artifact already).

const ANIMATE_TEXT = "{3}: This artifact becomes a 3/3 Construct artifact creature with flying until end of turn.";

export default defineCard({
  name: "Iron Suitcase",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `When this artifact enters, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Construct"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When this artifact enters, scry 2.",
    },
  ],
});
