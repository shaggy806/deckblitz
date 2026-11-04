import { defineCard } from "../define.js";

// Returned face down, so it enters with no enters abilities (rule 708.3), then
// turned face up by the effect, no cost paid (708.7): "when this is turned face
// up" triggers, a megamorph gets no counter. A manifested instant or sorcery
// stays in the graveyard.
const HASTE_TEXT = "Other creatures you control have haste.";
const DRAW_TEXT = "Whenever one or more face-down creatures you control deal combat damage to a player, draw a card.";
const RETURN_TEXT =
  "Whenever a face-down creature you control dies, return it to the battlefield face down under its owner's control if it's a permanent card, then turn it face up.";

export default defineCard({
  name: "Yarus, Roar of the Old Gods",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Centaur", "Druid"],
  power: 4,
  toughness: 4,
  text: `${HASTE_TEXT}\n${DRAW_TEXT}\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "creatures-you-control", excludeSelf: true }, grantKeywords: ["haste"], text: HASTE_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature", faceDown: true }, combat: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", faceDown: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object", faceDown: true, ifPermanentCard: true },
          { kind: "turn-face-up", target: "trigger-object" },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
