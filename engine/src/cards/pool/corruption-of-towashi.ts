import { defineCard } from "../define.js";

// EDHREC rank 19891.
//
// Rulings:
//   Only transforming double-faced permanents (transforming double-faced
//     cards and Incubator tokens) can transform; a permanent turning face
//     down or face up doesn't.
//   Only a transforming double-faced permanent can enter "transformed", and
//     only with its back face up: melded and modal double-faced permanents
//     can't.
//   The last ability triggers if a permanent you control transforms in either
//     direction.
//   Once you've chosen to draw a card, the ability stops triggering for the
//     rest of the turn.
//
// The `transforms` trigger in either direction, with `orEntersTransformed`
// for the entry (rules 712.14a, 701.27g); "do this only once each turn" is
// the `may`'s `oncePerTurn` (rule 603.2h), spent only when you draw.
const ENTER_TEXT = "When this enchantment enters, incubate 4.";
const REMINDER =
  "(Create an Incubator token with four +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)";
const DRAW_TEXT =
  "Whenever a permanent you control transforms or a permanent you control enters transformed, you may draw a card. Do this only once each turn.";

export default defineCard({
  name: "Corruption of Towashi",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} ${REMINDER}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 4 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "transforms", who: "you-control", orEntersTransformed: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card?",
        oncePerTurn: true,
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
