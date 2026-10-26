import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 28167.
//
// Impromptu Raid's reveal, except a card that isn't a creature card stays on
// top of the library (the ruling) and the haste lasts until end of turn.

const TEXT =
  "At the beginning of your upkeep, reveal the top card of your library. If it's a creature card, put it onto the battlefield. That creature gains haste until end of turn. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Killer Instinct",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "stay",
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice it at the beginning of the next end step.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
