import { defineCard } from "../define.js";

// EDHREC rank 9624.
//
// Rulings:
//   [2013-10-17] The tokens copy exactly what was printed on the original creature and nothing
//     else (unless that creature is copying something else or is a token; see below). They don’t
//     copy whether that creature is tapped or untapped, whether it has any counters on it or Auras
//     and Equipment attached to it, or any non-copy effects that have changed its power,
//     toughness, types, color, or so on.
//   [2013-10-17] If the creature you control is an illegal target when Tempt with Reflections
//     tries to resolve, it won’t resolve and none of its effects will happen. No copies will be
//     created.
//   [2013-10-17] Your opponents decide in turn order whether or not they accept the offer,
//     starting with the opponent on your left. Each opponent will know the decisions of previous
//     opponents in turn order when making their decision.
//   [2013-10-17] After each opponent has decided, the effect happens simultaneously for each one
//     who accepted the offer. Then, the effect happens again for you a number of times equal to
//     the number of opponents who accepted.

const COPY = { kind: "create-token-copy", of: 0, count: 1, who: "you" } as const;

// Tempt with Vengeance's tempting offer: the opponent's copy is their own
// effect (`who: "you"` is them there — a copy otherwise enters under the
// copied creature's controller), and `ifDid` gives you one more for each who
// did.
export default defineCard({
  name: "Tempt with Reflections",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tempting offer — Choose target creature you control. Create a token that's a copy of that creature. Each opponent may create a token that's a copy of that creature. For each opponent who does, create a token that's a copy of that creature.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      COPY,
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Create a token that's a copy of that creature?",
        effect: COPY,
        ifDid: COPY,
      },
    ],
  },
});
