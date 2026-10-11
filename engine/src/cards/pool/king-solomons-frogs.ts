import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 15753. Marvel Super Heroes Commander.
//
// "If you cast it" is the enters filter Rocco, Cabaretti Caterer reads. One
// optional target slot per opponent by seat (The Balrog of Moria), the
// exiles one event. "For each permanent exiled this way, its controller
// draws a card": each player draws as many as they controlled of the
// permanents exiled this way (`thisWay` per player — a permanent's controller
// as it left), so an empty or illegal slot draws nobody anything.
const ENTER_TEXT =
  "When King Solomon's Frogs enters, if you cast it, for each opponent, exile up to one target permanent that player controls with mana value 3 or greater. For each permanent exiled this way, its controller draws a card.";
const MONARCH_TEXT = "{3}, {T}, Exile King Solomon's Frogs: You become the monarch.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { manaValue: { op: "gte", n: 3 } } },
});

export default defineCard({
  name: "King Solomon's Frogs",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${MONARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { cast: true, castBy: "you" } },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "exile", target: 0 },
              { kind: "exile", target: 1 },
              { kind: "exile", target: 2 },
            ],
          },
          { kind: "draw", who: "each-player", amount: { thisWay: "exiled", who: "each" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true, exileSelf: true },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
  ],
});
