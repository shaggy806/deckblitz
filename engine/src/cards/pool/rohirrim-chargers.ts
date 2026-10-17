import { defineCard } from "../define.js";

// EDHREC rank 16606.
//
// Rulings:
//   [2023-11-03] You can't exert a creature unless an effect allows you to do so. Similar effects
//     that "tap and freeze" a creature or put stun counters on a creature don't exert that
//     creature.
//   [2023-11-03] You can exert Rohirrim Chargers as you declare it as an attacking creature. You
//     can't do so later in combat, and creatures put onto the battlefield attacking can't be
//     exerted. Any abilities that trigger on exerting an attacking creature will resolve before
//     blockers are declared.
//   [2023-11-03] If you gain control of another player's creature until end of turn and exert it,
//     it will untap during that player's untap step.
//   [2023-11-03] If an exerted creature is already untapped during your next untap step (most
//     likely because it had vigilance or an effect untapped it), exert's effect preventing it from
//     untapping expires without having done anything.
//   [2023-11-03] If the exerted creature is no longer on the battlefield or the Equipment can't
//     legally be attached to that creature, that Equipment will enter the battlefield unattached.

const EXERT_TEXT = "You may exert this creature as it attacks.";
const REVEAL_TEXT =
  "Whenever you exert a creature, reveal cards from the top of your library until you reveal an Equipment card. Put that card onto the battlefield attached to that creature, then put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Rohirrim Chargers",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  text: `${EXERT_TEXT} (It won't untap during your next untap step.)\n${REVEAL_TEXT}`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      // Any exert of a creature you control — this one's as it attacks, or
      // another card's. The exerted creature is the trigger object; the
      // Equipment enters attached to it, or unattached if it has left or
      // can't be equipped (the last ruling, rule 301.5e).
      trigger: { on: "exerted", who: "you-control" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { type: "artifact", subtype: "Equipment" },
        then: { kind: "put-onto-battlefield", target: 0, attachedTo: "trigger-object" },
        rest: "bottom-random",
      },
      resolve: null,
      text: REVEAL_TEXT,
    },
  ],
});
