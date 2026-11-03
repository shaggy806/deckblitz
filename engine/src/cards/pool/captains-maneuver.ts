import { defineCard } from "../define.js";

// One redirection shield on the first target, Carom's shape. "Another" is the
// second slot's own: not the first target, player or permanent. Battles aren't
// named, so this isn't "any target".

const SLOT = {
  kind: "permanent",
  filter: { typesAnyOf: ["creature", "planeswalker"] },
  orPlayer: "any",
} as const;

export default defineCard({
  name: "Captain's Maneuver",
  manaCost: "{X}{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "The next X damage that would be dealt to target creature, planeswalker, or player this turn is dealt to another target creature, planeswalker, or player instead.",
  targets: [SLOT, { kind: "other", of: SLOT, than: { slot: 0 } }],
  effect: { kind: "prevent-damage", target: 0, amount: "x", redirectTo: 1 },
});
