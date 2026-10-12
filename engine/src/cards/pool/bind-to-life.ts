import { defineCard } from "../define.js";

// Vastlands Scavenger's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Scavenger makes in exile (722.3c). Fetch
// Quest's shape: "from among them" is the cards milled this way — any one a
// replacement exiled instead is still found (rule 701.17c) — and putting one
// isn't optional ("put", not "you may put"); with no creature card among them,
// nothing is put.
export default defineCard({
  name: "Bind to Life",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["instant"],
  prepareSpellOnly: true,
  text: "Mill seven cards. Then put a creature card from among them onto the battlefield.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 7 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { thisWay: "milled", type: "creature" },
      },
    ],
  },
});
