import { defineCard } from "../define.js";

// EDHREC rank 7237.
//
// "That token gains haste" is an effect on the token, not a copy exception
// (Orthion, Hero of Lavabrink's shape), and it's sacrificed at the next end
// step (`sacrificeAtEndStep`).
//
// Rulings:
//   [2026-01-27] The token copies exactly what was printed on the original artifact (unless that
//     artifact is copying something else or is a token; see below). It doesn't copy whether that
//     artifact is tapped or untapped, whether it has any counters on it, or any Auras or Equipment
//     attached to it, or any non-copy effects that have changed its types, color, power and
//     toughness, and so on.
//   [2026-01-27] If the copied artifact is a token, the new token that's created copies the
//     original characteristics of that token as stated by the effect that created the token.
//   [2026-01-27] If the artifact copied by the token had any "when [this artifact] enters"
//     abilities, the token also has those abilities, and they'll trigger when it's created.
//     Similarly, any "as [this artifact] enters" or "[this artifact] enters with" abilities that
//     the token has copied will also work.
//   [2026-01-27] If the copied artifact is copying something else, then the token enters as
//     whatever that artifact copied.
//   [2026-01-27] If the copied artifact has {X} in its mana cost, X is 0.
const ANTHEM_TEXT = "Other artifact creatures you control get +1/+0.";
const COPY_TEXT =
  "{5}: Create a token that's a copy of another target artifact you control. That token gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Chrome Dome",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Ninja"],
  power: 1,
  toughness: 3,
  text: `${ANTHEM_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { types: ["artifact", "creature"], controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "artifact" } } }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        gains: { keywords: ["haste"] },
        sacrificeAtEndStep: true,
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
