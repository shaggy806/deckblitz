import { defineCard } from "../define.js";

// The tap cost has no {T}, so summoning-sick Druids — the Archdruid itself
// among them — can pay it (rule 302.6, the ruling). The control change has no
// duration (the ruling).

const DRAW_TEXT = "Whenever you cast a Druid spell, you may draw a card.";
const STEAL_TEXT = "Tap seven untapped Druids you control: Gain control of all lands target player controls.";

export default defineCard({
  name: "Gilt-Leaf Archdruid",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: `${DRAW_TEXT}\n${STEAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Druid" } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 7, filter: { subtype: "Druid", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["player"],
      effect: { kind: "gain-control-all", filter: { type: "land" }, untilEndOfTurn: false, controlledByTarget: 0 },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
