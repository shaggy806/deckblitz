import { defineCard } from "../define.js";

// Final Fantasy Commander. EDHREC rank 5405.
//
// Ruling: if damage that can't be prevented is dealt to the target creature
// after the ability resolves, you still put that many +1/+1 counters on it
// (rule 615.12: the prevention's other effect still happens) —
// `thenCountsUnprevented`. "Would be dealt to that creature" is one
// application per simultaneous damage event (rule 614.5): `perEvent`.
const ENTER_TEXT =
  "When Gatta and Luzzu enters, choose target creature you control. If damage would be dealt to that creature this turn, prevent that damage and put that many +1/+1 counters on it.";

export default defineCard({
  name: "Gatta and Luzzu",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "replacement-effect",
        replacement: {
          event: "would-deal-damage",
          instead: {
            prevent: true,
            then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
            perEvent: true,
            thenCountsUnprevented: true,
          },
        },
        duration: "end-of-turn",
        object: 0,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
