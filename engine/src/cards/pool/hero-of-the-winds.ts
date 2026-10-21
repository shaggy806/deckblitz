import { defineCard } from "../define.js";

// Theros Beyond Death. Heroic: once per spell however many times it targets
// this creature; the bonus goes to the creatures you control as it resolves.

const HEROIC = "Whenever you cast a spell that targets this creature, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Hero of the Winds",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${HEROIC}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: HEROIC,
    },
  ],
});
