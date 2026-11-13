import { defineCard } from "../define.js";

// EDHREC rank 3964.
//
// Rulings (abridged):
//   Replacement effects that modify how a creature enters are applied in
//   order: control-changing effects, then copy effects (Mystic Reflection's,
//   Clone's), then all other effects.
//   Any "as [this permanent] enters" or "enters with" abilities of the target
//   creature also work; the entering permanents' own enters replacements
//   don't, since they're already copies.
//   If the target leaves before the next time creatures or planeswalkers
//   enter, use its copiable values as it last existed on the battlefield.
//   With more than one Mystic Reflection, the entering permanent's controller
//   orders the copy effects, and the last applied wins.
//
// A resolved "next time" replacement (`replacement-effect`, `next: true`)
// with the `others-enter-battlefield` event's `asCopyOf` (`Game.enterAsCopyAsked`),
// spent by the one event, on everything entering in it.
const TEXT =
  "Choose target nonlegendary creature. The next time one or more creatures or planeswalkers enter this turn, they enter as copies of the chosen creature.";

export default defineCard({
  name: "Mystic Reflection",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  foretell: { cost: "{U}" },
  text: `${TEXT}\nForetell {U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  targets: [{ kind: "permanent", filter: { type: "creature", notSupertype: "legendary" } }],
  effect: {
    kind: "replacement-effect",
    duration: "end-of-turn",
    next: true,
    replacement: {
      event: "others-enter-battlefield",
      filter: { typesAnyOf: ["creature", "planeswalker"] },
      asCopyOf: { target: 0 },
    },
  },
});
