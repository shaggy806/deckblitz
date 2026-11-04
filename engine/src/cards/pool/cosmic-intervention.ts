import { defineCard } from "../define.js";

// Rulings:
//   A token that would be put into a graveyard is exiled and then ceases to exist. It won't return.
//   Each permanent exiled this way creates its own triggered ability to return itself; they all
//   trigger at the beginning of the next end step, in the order you choose.
const EXILE_TEXT =
  "If a permanent you control would be put into a graveyard from the battlefield this turn, exile it instead. Return it to the battlefield under its owner's control at the beginning of the next end step.";
const FORETELL_TEXT =
  "Foretell {1}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)";

export default defineCard({
  name: "Cosmic Intervention",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${EXILE_TEXT}\n${FORETELL_TEXT}`,
  foretell: { cost: "{1}{W}" },
  targets: [],
  effect: {
    kind: "player-effect",
    duration: "end-of-turn",
    graveyardExile: { filter: { controlledBy: "you" }, from: "battlefield", returnAtEndStep: true },
  },
});
