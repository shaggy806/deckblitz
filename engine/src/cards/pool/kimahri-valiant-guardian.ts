import { defineCard } from "../define.js";

// EDHREC rank 6932.
//
// Rulings:
//   [2025-06-06] If the copied creature is copying something else, then Kimahri becomes a copy of
//     whatever that creature is copying, with the listed exceptions.
//   [2025-06-06] If the target creature is an illegal target as Kimahri's last ability tries to
//     resolve, it won't resolve and none of its effects will happen. You won't put a counter on
//     Kimahri, and Kimahri won't become a copy of anything.
//   [2025-06-06] If the copied creature has {X} in its mana cost, X is 0.
//   [2025-06-06] If the copied creature is a token, Kimahri copies the original characteristics of
//     that token as stated by the effect that created the token, with the listed exceptions.
//   [2025-06-06] Kimahri copies exactly what was printed on the original creature, with the listed
//     exceptions (unless that creature is copying something else or is a token; see below). It
//     doesn't copy whether that creature is tapped or untapped, whether it has any counters on it
//     or any Auras or Equipment attached to it, or any non-copy effects that have changed its
//     types, color, power and toughness, and so on.
//
// One target, so an illegal one stops everything (the second ruling): the
// counter, the tap and the copy. The counter goes on before the copy and
// stays, a counter not being a copiable value. Irma's shape, with a `may`.

export default defineCard({
  name: "Kimahri, Valiant Guardian",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nRonso Rage — At the beginning of combat on your turn, put a +1/+1 counter on Kimahri and tap target creature an opponent controls. Then you may have Kimahri become a copy of that creature, except its name is Kimahri, Valiant Guardian and it has vigilance and this ability.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "tap", target: 0 },
          {
            kind: "may",
            prompt: "Have Kimahri become a copy of that creature?",
            effect: {
              kind: "become-copy",
              target: "source",
              of: 0,
              exceptions: {
                name: "Kimahri, Valiant Guardian",
                keywords: ["vigilance"],
                thisAbility: { card: "Kimahri, Valiant Guardian", triggered: 0 },
              },
            },
          },
        ],
      },
      resolve: null,
      text: "Ronso Rage — At the beginning of combat on your turn, put a +1/+1 counter on Kimahri and tap target creature an opponent controls. Then you may have Kimahri become a copy of that creature, except its name is Kimahri, Valiant Guardian and it has vigilance and this ability.",
    },
  ],
});
