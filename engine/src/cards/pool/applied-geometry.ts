import { defineCard } from "../define.js";

// EDHREC rank 12615.
//
// The copy's exceptions are Urza, Prince of Kroog's shape (base P/T 0/0,
// creature and Fractal added — copiable values, rule 707.9b). "Put six +1/+1
// counters on it" names the token this resolution made (`thisWay:
// "created"`); state-based actions don't see the 0/0 until the spell is done.
//
// Rulings:
//   [2026-03-20] Any enters abilities of the copied permanent will trigger when the token enters.
//     Any "as [this permanent] enters" or "[this permanent] enters with" abilities of the copied
//     permanent will also work.
//   [2026-03-20] The token created by Applied Geometry copies exactly what was printed on the
//     original permanent and nothing else, with the listed exception (unless that permanent is
//     copying something else or is a token; see below). It doesn't copy whether that permanent is
//     tapped or untapped, whether it has any counters on it or Auras and Equipment attached to it,
//     or any non-copy effects that have changed its power, toughness, types, color, or so on. If
//     it is a Vehicle, it is not crewed. If it is an Equipment, it is not attached to any
//     creature.
//   [2026-03-20] If the copied permanent is a token, the token that's created copies the original
//     characteristics of that token as stated by the effect that created the token, with the
//     listed exception.
//   [2026-03-20] If the copied permanent is copying something else, then the token enters as
//     whatever that permanent copied, with the listed exception.
export default defineCard({
  name: "Applied Geometry",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Create a token that's a copy of target non-Aura permanent you control, except it's a 0/0 Fractal creature in addition to its other types. Put six +1/+1 counters on it.",
  targets: [{ kind: "permanent", whose: "you", filter: { notSubtypes: ["Aura"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        exceptions: { basePt: [0, 0], addTypes: ["creature"], addSubtypes: ["Fractal"] },
      },
      { kind: "add-counter-all", filter: { thisWay: "created" }, counter: "+1/+1", amount: 6 },
    ],
  },
});
