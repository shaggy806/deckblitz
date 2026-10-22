import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 24763.
//
// Rulings:
//   [2017-03-14] You choose how many targets Fiery Justice has and how the damage is divided as
//     you cast it. Each target for its damage-dealing effect must receive at least 1 damage.
//   [2017-03-14] The target opponent for the life-gaining effect may also be a target for the
//     damage-dealing effect. If this happens and the damage brings that player's life total to 0
//     or less, the life-gaining effect will raise their life total above 0 again before the player
//     would lose the game.
//   [2017-03-14] If some (but not all) of the targets become illegal, the original division of
//     damage still applies, but no damage is dealt to illegal targets. If all targets become
//     illegal, including the target opponent for the life-gaining effect, Fiery Justice doesn't
//     resolve. If each target for the damage-dealing effect becomes illegal while the target for
//     the life-gaining effect remains legal, that player gains 5 life even though no damage is
//     dealt.
//
// Pyrotechnics' division (chosen as it's cast, at least 1 to each target —
// rule 601.2d), then the opponent in slot 0 gains 5 in the same resolution, so
// no state-based action runs between the damage and the life gain. The
// "any number" group runs to the end of the target list, so it comes second;
// the opponent may be one of its members too (rule 115.3).

export default defineCard({
  name: "Fiery Justice",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["sorcery"],
  text: "Fiery Justice deals 5 damage divided as you choose among any number of targets. Target opponent gains 5 life.",
  targets: ["opponent", { kind: "any-number", of: "any-target", max: 5 }],
  divided: { total: 5, slot: 1 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-divided", from: 1 },
      { kind: "gain-life", amount: 5, toControllerOfTarget: 0 },
    ],
  },
});
