import { defineCard } from "../define.js";

// EDHREC rank 10027.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn’t matter how long the
//     permanent has been a creature.
//   [2013-06-07] Lands that enter the battlefield or otehrwise come under your control after Rude
//     Awakening resolves won’t be affected.
//
// The second mode is `animate-all`, which animates the lands matching as it
// resolves (rule 611.2c — the second ruling). Entwine is Flourishing Strike's
// shape: `kicker.keyword: "entwine"` with `kickedModes: 2`.

export default defineCard({
  name: "Rude Awakening",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{2}{G}", keyword: "entwine" },
  text: "Choose one —\n• Untap all lands you control.\n• Until end of turn, lands you control become 2/2 creatures that are still lands.\nEntwine {2}{G} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Untap all lands you control.",
        targets: [],
        effect: { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
      },
      {
        text: "Until end of turn, lands you control become 2/2 creatures that are still lands.",
        targets: [],
        effect: {
          kind: "animate-all",
          filter: { type: "land", controlledBy: "you" },
          power: 2,
          toughness: 2,
          addTypes: ["creature"],
          duration: "end-of-turn",
        },
      },
    ],
    kickedModes: 2,
  },
});
