import { defineCard } from "../define.js";

// EDHREC rank 17150.
//
// Rulings:
//   [2023-09-01] You pay all costs and follow all normal timing rules for cards played from exile
//     this way.
//   [2023-09-01] You choose whether to sacrifice Rotisserie Elemental as its triggered ability
//     resolves. No player may respond between the time you sacrifice it and the time you exile
//     cards from the top of your library.
//
// X is read after the sacrifice, from the creature as it last existed on the
// battlefield (rule 608.2h) — the skewer counters it died with.

const TEXT =
  "Whenever this creature deals combat damage to a player, put a skewer counter on this creature. Then you may sacrifice it. If you do, exile the top X cards of your library, where X is the number of skewer counters on this creature. You may play those cards this turn.";

export default defineCard({
  name: "Rotisserie Elemental",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "skewer", amount: 1 },
          {
            kind: "may",
            prompt: "Sacrifice Rotisserie Elemental to exile cards equal to its skewer counters?",
            effect: {
              kind: "sacrifice-source",
              then: {
                kind: "impulse-exile",
                amount: { countersOn: "source", counter: "skewer" },
                duration: "end-of-turn",
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
