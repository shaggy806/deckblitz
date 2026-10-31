import { defineCard } from "../define.js";

// "Its controller's next combat phase": the controller as it resolves, and
// not a combat phase of theirs already under way.
const UNTAP_TEXT = "Return a land you control to its owner's hand: Untap this creature. It gains hexproof until end of turn.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, target creature an opponent controls attacks during its controller's next combat phase if able.";

export default defineCard({
  name: "Trench Behemoth",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 7,
  toughness: 7,
  text: `${UNTAP_TEXT}\n${LANDFALL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "grant-keyword", target: "source", keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "attack-requirement", target: 0, duration: "controllers-next-combat" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
