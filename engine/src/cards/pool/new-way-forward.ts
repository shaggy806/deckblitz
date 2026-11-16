import { defineCard } from "../define.js";

// Tarkir: Dragonstorm (TDM). EDHREC rank 11227.
//
// Deflecting Palm's shield, whose follow-up is a triggered ability rather
// than Deflecting Palm's "if damage is prevented this way" (rule 615.5):
// "when damage is prevented this way" is an ability the spell's resolution
// created (rule 603.7a), triggering as the shield prevents the damage — the
// shield's `then` a `reflexive-trigger` — and put on the stack the next time
// a player would receive priority, so players can respond to it. It knows
// the damage prevented (its X) and that source (its trigger object), whose
// controller is dealt the damage — as that source last existed, if it has
// left (rule 608.2h).
//
// Rulings:
//   - New Way Forward doesn't target any permanent or player. You choose a source as New Way
//     Forward resolves.
//   - If another effect (or effects) modifies how much damage the chosen source would deal to
//     you this turn, you choose the order in which any such effects, including the effect of New
//     Way Forward, apply.

const REFLEXIVE =
  "When damage is prevented this way, New Way Forward deals that much damage to that source's controller and you draw that many cards.";

export default defineCard({
  name: "New Way Forward",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["instant"],
  text: `The next time a source of your choice would deal damage to you this turn, prevent that damage. ${REFLEXIVE}`,
  targets: [],
  effect: {
    kind: "prevent-damage-from-chosen-source",
    to: "you",
    amount: "next-time",
    then: {
      kind: "reflexive-trigger",
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: "x", who: "trigger-controller" },
          { kind: "draw", amount: "x" },
        ],
      },
      text: REFLEXIVE,
    },
  },
});
