import { defineCard } from "../define.js";

// EDHREC rank 7326.

export default defineCard({
  name: "Southern Air Temple",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Shrine"],
  text: "When Southern Air Temple enters, put X +1/+1 counters on each creature you control, where X is the number of Shrines you control.\nWhenever another Shrine you control enters, put a +1/+1 counter on each creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // X is counted as it resolves, this Shrine included.
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: { countOf: { subtype: "Shrine", controlledBy: "you" } },
      },
      resolve: null,
      text: "When Southern Air Temple enters, put X +1/+1 counters on each creature you control, where X is the number of Shrines you control.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Shrine" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "Whenever another Shrine you control enters, put a +1/+1 counter on each creature you control.",
    },
  ],
});
