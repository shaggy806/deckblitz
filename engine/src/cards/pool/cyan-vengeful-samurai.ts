import { defineCard } from "../define.js";

// EDHREC rank 10307. Final Fantasy.
//
// Rulings:
//   [2025-06-06] If multiple creature cards leave your graveyard at the same time, Cyan's last
//     ability will trigger only once.
//
// Karador's reduction (creature cards in your graveyard) and Grim Reaper's
// Scythe's batched "one or more creature cards leave your graveyard".
const GROW_TEXT = "Whenever one or more creature cards leave your graveyard, put a +1/+1 counter on Cyan.";

export default defineCard({
  name: "Cyan, Vengeful Samurai",
  manaCost: "{6}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["double-strike"],
  text: `This spell costs {1} less to cast for each creature card in your graveyard.\nDouble strike\n${GROW_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { type: "creature" } },
  },
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
