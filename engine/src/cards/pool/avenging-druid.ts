import { defineCard } from "../define.js";

// EDHREC rank 21981.
//
// Rulings:
//   [2004-10-04] The ability does not work if all damage is prevented.
//   [2004-10-04] Putting a land onto the battlefield does not count as playing a land.
//
// Any damage to an opponent, combat or not (`deals-damage` to "opponent"). "If you
// do" follows the "you may": revealing at all is the choice, and then the land
// found enters and every other revealed card goes to the graveyard — with no land
// in the library, all of it (the `reveal-until` miss).
const TEXT =
  "Whenever this creature deals damage to an opponent, you may reveal cards from the top of your library until you reveal a land card. If you do, put that card onto the battlefield and put all other cards revealed this way into your graveyard.";

export default defineCard({
  name: "Avenging Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal cards from the top of your library until you reveal a land card?",
        effect: { kind: "reveal-until", filter: { type: "land" }, put: "battlefield", rest: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
