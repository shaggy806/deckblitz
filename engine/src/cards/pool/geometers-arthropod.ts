import { defineCard } from "../define.js";

// EDHREC rank 9977.
//
// Rulings:
//   [2026-03-20] In some rare cases, the value of X for the spell on the stack may be different
//     than the value that was chosen when you cast it. For example, if you control Unbound
//     Flourishing (an enchantment with "Whenever you cast a permanent spell with a mana cost that
//     contains {X}, double the value of X.") the value of X may have been doubled. In those cases,
//     use the value of X as the spell exists on the stack at the time Geometer's Arthropod's
//     ability resolves to determine the value of X for Geometer's Arthropod's ability.
//   [2026-03-20] Geometer's Arthropod's ability resolves before the spell that caused it to
//     trigger. It resolves even if that spell is countered or otherwise leaves the stack without
//     resolving. In that case, use the value of X as that spell last existed on the stack to
//     determine the value of X for Geometer's Arthropod's ability.

const LOOK_TEXT =
  "Whenever you cast a spell with {X} in its mana cost, look at the top X cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.";

// X is the cast spell's X (rule 107.3m: a cast trigger snapshots it), so a
// countered spell still gives its look (the ruling). The ruling's other case
// — X changed on the stack after the cast (Unbound Flourishing) — can't
// arise: nothing in the pool changes a spell's X once it's cast.
export default defineCard({
  name: "Geometer's Arthropod",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Fractal", "Crab"],
  power: 1,
  toughness: 4,
  text: LOOK_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { xInManaCost: true } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
