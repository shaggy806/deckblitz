import { defineCard } from "../define.js";

// The granted ability belongs to the enchanted creature, so "this creature"
// is it. "Except by snow creatures" is "can't be blocked by nonsnow
// creatures" (rule 509.1b), a rule on it for the turn.

const GRANTED = "{S}: This creature can't be blocked this turn except by snow creatures.";
const TEXT = `Enchanted creature gets +2/+1 and has "${GRANTED}" ({S} can be paid with one mana from a snow source.)`;

export default defineCard({
  name: "Rime Transfusion",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantsActivated: [
        {
          cost: { mana: "{S}", tap: false },
          targets: [],
          effect: { kind: "restrict", target: "source", restrictions: [], cantBeBlockedBy: { notSupertype: "snow" } },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
