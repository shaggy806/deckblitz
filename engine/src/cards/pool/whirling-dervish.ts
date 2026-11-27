import { defineCard } from "../define.js";

// Legends. EDHREC rank 29569.
//
// Dunerider Outlaw's trigger: `dealtDamageThisTurn` with `to: "opponent"`,
// read against its current controller.
//
// Rulings:
//   - It gets at most one +1/+1 counter each turn, however many opponents were dealt damage.
//   - An opponent dealt damage who later left the game still counts.
//   - It checks for an opponent of its current controller: if it dealt damage to player A,
//     then player A takes control of it, the ability doesn't trigger.

const TRIGGER_TEXT =
  "At the beginning of each end step, if this creature dealt damage to an opponent this turn, put a +1/+1 counter on it.";

export default defineCard({
  name: "Whirling Dervish",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 1,
  text: `Protection from black\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "source", filter: { dealtDamageThisTurn: { to: "opponent" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
