import { defineCard } from "../define.js";

// EDHREC rank 7855.
//
// "If a creature enters this way" is the counters' `ifCreature`: judged as the
// permanent exists on the battlefield (rule 614.12), so an artifact card that
// isn't a creature there enters with none.

export default defineCard({
  name: "Recommission",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target artifact or creature card with mana value 3 or less from your graveyard to the battlefield. If a creature enters this way, it enters with an additional +1/+1 counter on it.",
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: {
    kind: "put-onto-battlefield",
    target: 0,
    withCounters: { kind: "+1/+1", amount: 1, ifCreature: true },
  },
});
