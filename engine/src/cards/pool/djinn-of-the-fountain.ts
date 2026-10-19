import { defineCard } from "../define.js";

// EDHREC rank 24987.
//
// Rulings:
//   [2022-09-09] Djinn of the Fountain's triggered ability will resolve before the instant or
//     sorcery spell that caused it to trigger resolves. It will resolve even if the spell that
//     caused it to trigger is countered or has otherwise left the stack.
//
// A modal triggered ability announces its mode as it goes on the stack
// (rule 700.2b — `announced`). The exile-and-return is a `flicker` with a
// delayed return linked to the exile (rule 610.3).

const TRIGGER_TEXT = "Whenever you cast an instant or sorcery spell, choose one —";
const PUMP_MODE = "This creature gets +1/+1 until end of turn.";
const BLINK_MODE =
  "Exile this creature. Return it to the battlefield under its owner's control at the beginning of the next end step.";
const SCRY_MODE = "Scry 1.";
const TEXT = `${TRIGGER_TEXT}\n• ${PUMP_MODE}\n• ${BLINK_MODE}\n• ${SCRY_MODE}`;

export default defineCard({
  name: "Djinn of the Fountain",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: PUMP_MODE,
            effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          },
          {
            text: BLINK_MODE,
            effect: {
              kind: "flicker",
              target: "source",
              returnAt: "next-end-step",
              returnText: "Return Djinn of the Fountain to the battlefield under its owner's control.",
            },
          },
          { text: SCRY_MODE, effect: { kind: "scry", amount: 1 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
