import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 10976.
//
// The opponent is slot 0, chosen first: X is read from that player's side as the targets are
// announced (`maxReadsSlot: 0`), and the cards are an "up to X" group after it (rule 601.2c).
// Once the number of targets is set it doesn't change, however many black permanents that
// player controls by the time Reap resolves.
//
// Rulings:
//   The count of the number of black permanents the targeted opponent controls is done during
//     announcement since it only affects target selection. It does not get recounted later.
//   This card has received errata so that it now targets a specific opponent.

const TEXT =
  "Return up to X target cards from your graveyard to your hand, where X is the number of black permanents target opponent controls as you cast this spell.";

export default defineCard({
  name: "Reap",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: [
    "opponent",
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you" },
      max: { countOf: { colors: ["B"], controlledBy: "you" }, forTarget: 0 },
      maxReadsSlot: 0,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 1,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 1, from: "graveyard" },
  },
});
