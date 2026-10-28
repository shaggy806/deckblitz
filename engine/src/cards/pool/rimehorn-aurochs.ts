import { defineCard } from "../define.js";

// EDHREC rank 25749. "Target creature blocks target creature"
// is `block-if-able` with `attacker: 1`; a first creature that can't block the
// second is under no requirement (the ruling).

const LURE = "{2}{S}: Target creature blocks target creature this turn if able. ({S} can be paid with one mana from a snow source.)";
const ATTACKS = "Whenever this creature attacks, it gets +1/+0 until end of turn for each other attacking Aurochs.";

export default defineCard({
  name: "Rimehorn Aurochs",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Aurochs"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ATTACKS}\n${LURE}`,
  activated: [
    {
      cost: { mana: "{2}{S}", tap: false },
      targets: ["creature", "creature"],
      effect: { kind: "block-if-able", target: 0, attacker: 1 },
      resolve: null,
      text: LURE,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", subtype: "Aurochs", attacking: true }, excludeSelf: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
