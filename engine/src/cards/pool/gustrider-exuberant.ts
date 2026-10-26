import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] The ability doesn’t target, so it checks the creatures’ powers only once: when
//     the ability resolves. Once the ability resolves, it will continue to apply to the affected
//     creatures no matter what their powers may become later in the turn.
//     (`grant-keyword-all` grants to the creatures matching as it resolves.)

const SAC_TEXT = "Sacrifice this creature: Creatures you control with power 5 or greater gain flying until end of turn.";

export default defineCard({
  name: "Gustrider Exuberant",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 5 } },
        keyword: "flying",
        duration: "end-of-turn",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
