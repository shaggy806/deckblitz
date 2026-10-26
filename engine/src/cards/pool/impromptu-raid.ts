import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 29507.
//
// Call of the Wild's reveal with Sneak Attack's `then`: a revealed creature
// card must go onto the battlefield (min 1), anything else goes to the
// graveyard. The haste lasts as long as it's on the battlefield (the ruling
// on a creature another player gains control of), and the sacrifice is at the
// next end step — the following turn's, if activated during an end step.

const TEXT =
  "{2}{R/G}: Reveal the top card of your library. If it isn't a creature card, put it into your graveyard. Otherwise, put that card onto the battlefield. That creature gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Impromptu Raid",
  manaCost: "{3}{R/G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R/G}", tap: false },
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
        leftover: "graveyard",
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
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
