import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const ENTER_TEXT =
  "When Ezrim enters, investigate twice. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const GAIN_TEXT =
  "{1}, Sacrifice an artifact: Ezrim gains your choice of vigilance, lifelink, or hexproof until end of turn.";

export default defineCard({
  name: "Ezrim, Agency Chief",
  manaCost: "{1}{W}{W}{U}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Archon", "Detective"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${GAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: investigate(2),
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      // "Your choice of" is chosen as the ability resolves (Assassin
      // Initiate's shape).
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Vigilance", effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" } },
          { text: "Lifelink", effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" } },
          { text: "Hexproof", effect: { kind: "grant-keyword", target: "source", keyword: "hexproof", duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
