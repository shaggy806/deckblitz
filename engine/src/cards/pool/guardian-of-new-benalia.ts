import { defineCard } from "../define.js";
import { enlist, ENLIST_TEXT } from "../helpers.js";

const ENLISTS_TEXT = "Whenever this creature enlists a creature, scry 2.";
const DISCARD_TEXT = "Discard a card: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Guardian of New Benalia",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${ENLIST_TEXT}\n${ENLISTS_TEXT}\n${DISCARD_TEXT}`,
  static: [enlist()],
  triggered: [
    {
      trigger: { on: "event", event: "enlists", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: ENLISTS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
