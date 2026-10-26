import { defineCard } from "../define.js";

// EDHREC rank 25319.
//
// Rulings:
//   [2011-01-22] Warden of the Wall still has the ability to tap for mana when it's not your turn.
//
// Midnight Mangler's "during turns other than yours" animation, with the
// Gargoyle subtype, a 2/3 base and flying in the same static.

const ANIMATE = "During turns other than yours, this artifact is a 2/3 Gargoyle artifact creature with flying.";

export default defineCard({
  name: "Warden of the Wall",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n{T}: Add {C}.\n${ANIMATE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      addTypes: ["creature"],
      addSubtypes: ["Gargoyle"],
      setBasePt: { power: 2, toughness: 3 },
      grantKeywords: ["flying"],
      text: ANIMATE,
    },
  ],
});
