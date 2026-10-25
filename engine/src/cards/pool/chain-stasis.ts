import { defineCard } from "../define.js";

// EDHREC rank 19565.
//
// Rulings:
//   [2004-10-04] The spell copy has all the text and can result in itself being copied.
//   [2004-10-04] The decision to tap or untap is made on resolution of the spell (and of each
//     copy).
//   [2004-10-04] Paying to make Chain Stasis continue is done as part of the resolution of the
//     spell.
//   [2004-10-04] The player putting the copy spell on the stack controls that spell.
//   [2004-10-04] The copy is a spell, so it can be targeted by other spells and abilities that
//     target a spell.
//
// Retreat to Coralhelm's "you may tap or untap" (a resolution-time modal of
// none or one), then String of Disappearances' chain: the creature's
// controller may pay, and if they do may copy it, the copy theirs.

export default defineCard({
  name: "Chain Stasis",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may tap or untap target creature. Then that creature's controller may pay {2}{U}. If the player does, they may copy this spell and may choose a new target for that copy.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target creature", effect: { kind: "tap", target: 0 } },
          { text: "Untap target creature", effect: { kind: "untap", target: 0 } },
        ],
      },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [{ pay: "{2}{U}", text: "Pay {2}{U}" }],
        ifDid: {
          kind: "each-player-may",
          who: "that-player",
          prompt: "Copy Chain Stasis? (You may choose a new target for the copy.)",
          effect: { kind: "copy-spell", target: "source", newTargets: true },
        },
      },
    ],
  },
});
