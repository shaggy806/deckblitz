import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES } from "../helpers.js";

// The chosen basic land type gives it that type's intrinsic mana ability (rule 305.6), its own
// text kept — "in addition" sets nothing, so rule 305.7 doesn't apply. Every mana ability it has,
// that one included, costs 1 more life (`increaseLife`), paid by hand or while paying a cost; with
// no life to pay, none can be activated (rule 119.4).
const TAPPED = "This land enters tapped unless you control two or fewer other lands.";
const TYPE = "This land is the chosen type in addition to its other types.";
const LIFE = "Mana abilities of this land cost an additional 1 life to activate.";

export default defineCard({
  name: "Thran Portal",
  colors: [],
  types: ["land"],
  subtypes: ["Gate"],
  text: `${TAPPED}\nAs this land enters, choose a basic land type.\n${TYPE}\n${LIFE}`,
  chooseOnEnter: BASIC_LAND_TYPE_CHOICES,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 3 } },
      },
      text: TAPPED,
    },
    { affects: { scope: "self" }, addsChosenLandType: true, text: TYPE },
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { isSource: true }, abilityKind: "mana", increaseLife: 1 },
      text: LIFE,
    },
  ],
});
