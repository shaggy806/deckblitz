import { defineCard } from "../define.js";

// EDHREC rank 28290.
//
// Rulings:
//   [2020-08-07] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger. It resolves even if that spell is countered.

export default defineCard({
  name: "Painsmith",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: "Whenever you cast an artifact spell, you may have target creature get +2/+0 and gain deathtouch until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get +2/+0 and gain deathtouch until end of turn?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: "Whenever you cast an artifact spell, you may have target creature get +2/+0 and gain deathtouch until end of turn.",
    },
  ],
});
