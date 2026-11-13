import { defineCard } from "../define.js";

// One resolution, one target: the opponent can't cast spells this turn, and
// for the turn Xanathar's controller looks at the top of their library any
// time (`looksAtLibraryTopOf`) and may play it (`mayPlay` from that player's
// library top, `whose`), spending mana as though it were any color on a
// spell cast that way. A land played this way takes their land drop (305.2).
const TEXT =
  "At the beginning of your upkeep, choose target opponent. Until end of turn, that player can't cast spells, you " +
  "may look at the top card of their library any time, you may play the top card of their library, and you may " +
  "spend mana as though it were mana of any color to cast spells this way.";

export default defineCard({
  name: "Xanathar, Guild Kingpin",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beholder"],
  power: 5,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "prohibit", prohibits: [{ act: "cast", who: { target: 0 } }] },
          {
            kind: "player-effect",
            duration: "end-of-turn",
            looksAtLibraryTopOf: { target: 0 },
            mayPlay: { from: "library-top", whose: { target: 0 }, play: true, spendAs: "any-color" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
