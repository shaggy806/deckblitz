import { defineCard } from "../define.js";

// EDHREC rank 18929.
//
// Rulings:
//   If there is no exiled card as the last ability resolves (most likely
//     because this creature left the battlefield while it was on the stack),
//     X is 0. The same is true if the exiled card has no power.
//   If a Vehicle is exiled, use its printed power.
//   If a token is exiled this way, it ceases to exist and won't return.
//   If this creature leaves before its first ability resolves, the target
//     creature won't be exiled.
//   X is determined only as the second ability resolves, and won't change if
//     the card leaves exile later in the turn.
//
// Banisher Priest's exile-until-it-leaves (rule 610.3); "the exiled card" is
// the linked one (rule 607.2a), read through the `"exiled-with-source"` set,
// which holds the card exiled until this creature leaves while this creature
// is still on the battlefield in that stint — none once it has left (the
// first ruling). Its power is the card's in exile, printed (a Vehicle's
// too), and a card with none adds 0. `modify-pt` locks the amount as it
// resolves (rule 608.2h).
const ENTER_TEXT =
  "When this creature enters, exile target creature an opponent controls until this creature leaves the battlefield.";
const ATTACK_TEXT =
  "Whenever this creature attacks, target Vampire gets +X/+X until end of turn, where X is the power of the exiled card.";

const X = { aggregate: "sum", of: "power", filter: {}, in: "exiled-with-source" } as const;

export default defineCard({
  name: "Bishop of Binding",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Vampire" } }],
      effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
