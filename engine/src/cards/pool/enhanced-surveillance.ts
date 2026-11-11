import { defineCard } from "../define.js";

// The extra cards are part of the surveil: any of them may go to the graveyard or stay on top in
// any order (rule 701.25b). A surveil of 0 isn't one (701.25c). The enchantment is exiled as a
// cost, so it isn't in the graveyard it shuffles.

const LOOK = "You may look at an additional two cards each time you surveil.";
const SHUFFLE = "Exile this enchantment: Shuffle your graveyard into your library.";

export default defineCard({
  name: "Enhanced Surveillance",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${LOOK}\n${SHUFFLE}`,
  static: [{ affects: { scope: "self" }, surveilAdditional: 2, text: LOOK }],
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you" },
      resolve: null,
      text: SHUFFLE,
    },
  ],
});
