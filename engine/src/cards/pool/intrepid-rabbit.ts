import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// Bloomburrow (BLB). EDHREC rank 13128. Offspring (rule 702.175) as Agate Instigator
// has it; the 1/1 copy's own enters trigger pumps too (the ruling).
const ETB_TEXT = "When this creature enters, target creature you control gets +1/+1 until end of turn.";

export default defineCard({
  name: "Intrepid Rabbit",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rabbit", "Soldier"],
  power: 3,
  toughness: 2,
  text: `Offspring {1} (You may pay an additional {1} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\n${ETB_TEXT}`,
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  kicker: { cost: "{1}", keyword: "offspring" },
});
