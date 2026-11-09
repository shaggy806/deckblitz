import { defineCard } from "../define.js";
import { equip, investigate } from "../helpers.js";

// EDHREC rank 12245. A Clue is Equipment only while this is here: attached ones
// fall off as it leaves (the ruling, rule 704.5p), and they're read as they are
// (rule 301.5c), so a Clue that's also a creature can't be attached.
const ENTER_TEXT = "When this enchantment enters, investigate twice.";
const GRANTED_TEXT = "Equipped creature gets +2/+0";
const STATIC_TEXT = `Clues you control are Equipment in addition to their other types and have "${GRANTED_TEXT}" and equip {2}.`;

export default defineCard({
  name: "Armed with Proof",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} (To investigate, create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sequence", effects: [investigate(), investigate()] },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Clue", controlledBy: "you" } },
      addSubtypes: ["Equipment"],
      grantsStatic: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: GRANTED_TEXT }],
      grantsActivated: [equip("{2}")],
      text: STATIC_TEXT,
    },
  ],
});
