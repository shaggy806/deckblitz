import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 27629.
//
// "Dealt damage to an opponent this turn" is `dealtDamageThisTurn` with
// `to: "opponent"`, read against its controller as the ability triggers and
// resolves (rule 603.4): damage to a player who has since taken control of it
// doesn't count, damage to one who has since left the game does.
//
// Rulings:
//   - It gets at most one +1/+1 counter each turn, however many opponents were dealt damage.
//   - An opponent dealt damage who later left the game still counts.
//   - It checks for an opponent of its current controller: if it dealt damage to player A,
//     then player A takes control of it, the ability doesn't trigger.

const TRIGGER_TEXT =
  "At the beginning of each end step, if this creature dealt damage to an opponent this turn, put a +1/+1 counter on it.";

export default defineCard({
  name: "Dunerider Outlaw",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Rogue"],
  power: 1,
  toughness: 1,
  text: `Protection from green\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["G"] },
      text: "Protection from green",
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
