import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 21263.
//
// The type is chosen as the trigger resolves (Distant Melody's
// `choose-creature-type`), then Rooting Kavu's filtered graveyard shuffle
// with the chosen type substituted into its filter. Elvish Soultiller is in
// the graveyard by then, so it goes in too when Elf or Mutant is chosen; the
// library is shuffled even when nothing matches.
const TEXT =
  "When this creature dies, choose a creature type. Shuffle all creature cards of that type from your graveyard into your library.";

export default defineCard({
  name: "Elvish Soultiller",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Mutant"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "shuffle-graveyard-into-library",
          target: "you",
          filter: { type: "creature", subtype: CHOSEN_CREATURE_TYPE },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
