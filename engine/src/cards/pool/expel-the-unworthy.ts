import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 23857. Modern Horizons 3.
//
// Tear Asunder's kicker, whose `targets` replace the unkicked ones; Swords
// to Plowshares' life for the exiled creature's controller. Its mana value is
// read as the creature last existed on the battlefield (the ruling) — a
// face-down creature's is 0.
//
// Rulings:
//   [2024-06-07] Use the creature's mana value as it last existed on the battlefield to determine
//     how much life its controller gains.

const EXILE: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "exile", target: 0 },
    { kind: "gain-life", amount: { manaValueOf: 0 }, toControllerOfTarget: 0 },
  ],
};

export default defineCard({
  name: "Expel the Unworthy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Kicker {2}{W} (You may pay an additional {2}{W} as you cast this spell.)\nChoose target creature with mana value 3 or less. If this spell was kicked, instead choose target creature. Exile the chosen creature, then its controller gains life equal to its mana value.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: EXILE,
  kicker: { cost: "{2}{W}", targets: ["creature"], effect: EXILE },
});
