import { defineCard } from "../define.js";

// EDHREC rank 456.
//
// "You may sacrifice another creature. If you do, …": the whole sequence is the
// `may`, so declining does nothing, and with no other creature nothing is
// sacrificed and X is 0. X is the sacrificed creature's power as it last existed
// on the battlefield (the ruling) — the `thisWay` record of the sacrifice, as
// Disciple of Bolas reads it.
const TEXT =
  "When this creature enters, you may sacrifice another creature. If you do, you gain X life and draw X cards, where X is that creature's power.";
const X = { thisWay: "sacrificed", sumOf: "power" } as const;

export default defineCard({
  name: "Disciple of Freyalise",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice another creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exceptSource: true },
            { kind: "gain-life", amount: X },
            { kind: "draw", amount: X },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Disciple of Freyalise", "Garden of Freyalise"],
});
