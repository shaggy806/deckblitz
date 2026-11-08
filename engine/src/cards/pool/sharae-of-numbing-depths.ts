import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Sharae enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const TAP_TEXT =
  "Whenever you tap one or more untapped creatures your opponents control, draw a card. This ability triggers only once each turn.";

// `becomes-tapped`'s `by` (B278), with "triggers only once each turn" (rule
// 603.2) making "one or more" exact: the first of the tapping fires it.
export default defineCard({
  name: "Sharae of Numbing Depths",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "becomes-tapped", who: "opponent", filter: { type: "creature" }, by: "you" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
