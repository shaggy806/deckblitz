import { defineCard } from "../define.js";

const DRAW_TEXT = "Whenever you activate an ability of a creature, draw a card. This ability triggers only once each turn.";
const FLICKER_TEXT =
  "{5}{U}{U}: Exile up to two other target nonland permanents you control. Return those cards to the battlefield under their owner's control at the beginning of the next end step.";

// `activates-ability`'s `orMana` (B278): a creature's mana ability counts,
// one activated while paying a cost included (rule 605).
export default defineCard({
  name: "Elrond, Moon-Reader",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 3,
  text: `${DRAW_TEXT}\n${FLICKER_TEXT}`,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", source: { type: "creature" }, orMana: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      targets: [
        {
          kind: "any-number",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } },
          min: 0,
          max: 2,
        },
      ],
      effect: {
        kind: "flicker",
        target: { from: 0 },
        returnAt: { step: "end" },
        returnText: "Return those cards to the battlefield under their owner's control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
