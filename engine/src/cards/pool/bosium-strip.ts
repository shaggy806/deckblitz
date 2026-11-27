import { defineCard } from "../define.js";

const TEXT =
  "{3}, {T}: Until end of turn, you may cast instant and sorcery spells from the top of your graveyard. If a spell cast this way would be put into a graveyard, exile it instead.";

// EDHREC rank 24033. The Great Work's permission over your own graveyard,
// reaching only its top card (`topOfGraveyard`, rule 404.2): cast that one
// and the next card down is the top, castable in turn. A rule for the turn
// (611.2c), so a card put there later is reached too.
export default defineCard({
  name: "Bösium Strip",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        mayPlay: {
          from: "graveyard",
          filter: { typesAnyOf: ["instant", "sorcery"], topOfGraveyard: true },
          exileAfter: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
