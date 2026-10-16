import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const LORD_TEXT = "Skeletons and Zombies you control get +1/+1 and have menace.";
const CRIME_TEXT =
  "Whenever you commit a crime, create two tapped 2/2 blue and black Zombie Rogue creature tokens. This ability triggers only once each turn.";

export default defineCard({
  name: "Gisa, the Hellraiser",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 4,
  text: `Ward—{2}, Pay 2 life.\n${LORD_TEXT}\n${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  static: [
    {
      // One static: a Skeleton Zombie gets +1/+1 once.
      affects: { scope: "filter", filter: { type: "creature", subtypes: ["Skeleton", "Zombie"], controlledBy: "you" } },
      grantPt: [1, 1],
      grantKeywords: ["menace"],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    ward({ mana: "{2}", payLife: 2 }),
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Rogue Token", count: 2, tapped: true },
      resolve: null,
      oncePerTurn: true,
      text: CRIME_TEXT,
    },
  ],
});
