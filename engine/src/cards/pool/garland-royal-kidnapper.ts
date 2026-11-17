import { defineCard } from "../define.js";

// Final Fantasy Commander (FIC). EDHREC rank 11948.
//
// "For as long as they're the monarch" is `gain-control`'s `whileMonarch`:
// the player who became the monarch, read as the ability resolves; the
// control ends for good the first moment they aren't the monarch (rule
// 725.3), and does nothing at all if they already weren't as it resolved
// (611.2b — the last ruling). "Creatures you control but don't own" are those
// an opponent owns: every other player in a free-for-all game.
//
// Rulings:
//   - While Garland is on the battlefield, creatures you control but don't own can't be sacrificed
//     for any reason. If an effect instructs you to sacrifice one of them, you can't and it remains
//     on the battlefield. You also can't sacrifice one of them to pay a cost that requires you to
//     sacrifice a creature.
//   - If an effect instructs you to sacrifice a creature and you control any creatures other than
//     ones you control but don't own, you must sacrifice one of those other creatures. You can't try
//     to sacrifice a creature you control but don't own.
//   - If the monarch leaves the game during another player's turn, that player becomes the monarch.
//     If the monarch leaves the game during their turn, the next player in turn order becomes the
//     monarch.
//   - While Garland's second ability is on the stack, if that opponent stops being the monarch
//     before it resolves, you won't gain control of the target creature at all.

const ENTER_TEXT = "When Garland enters, target opponent becomes the monarch.";
const STEAL_TEXT =
  "Whenever an opponent becomes the monarch, gain control of target creature that player controls for as long as they're the monarch.";
const STATIC_TEXT = "Creatures you control but don't own get +2/+2 and can't be sacrificed.";

export default defineCard({
  name: "Garland, Royal Kidnapper",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  text: `${ENTER_TEXT}\n${STEAL_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "become-monarch", who: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "event", event: "becomes-monarch", who: "opponent" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileMonarch: "trigger-player" },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ownedBy: "opponent" } },
      grantPt: [2, 2],
      cantBeSacrificed: true,
      text: STATIC_TEXT,
    },
  ],
});
