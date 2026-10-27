import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Fifth Dawn (5DN). EDHREC rank 23260. Iron Suitcase's animation: a 1/5
// Spirit artifact creature with flying until end of turn (it keeps its
// Equipment subtype; an Equipment that's a creature can't equip a creature —
// rule 301.5c).

const ANIMATE_TEXT =
  "{3}: This artifact becomes a 1/5 Spirit artifact creature with flying until end of turn. (Equipment that's a creature can't equip a creature.)";
const PUMP_TEXT = "Equipped creature gets +1/+5.";

export default defineCard({
  name: "Ensouled Scimitar",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ANIMATE_TEXT}\n${PUMP_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 5], text: PUMP_TEXT }],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 1,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Spirit"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    equip("{2}"),
  ],
});
