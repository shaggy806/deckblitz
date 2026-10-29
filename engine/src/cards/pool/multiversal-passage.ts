import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES } from "../helpers.js";

// The type is chosen as it enters (614.1c), then the 2 life is offered; the
// land is that basic land type, so it has the type's intrinsic mana ability
// (305.6) and no other.
export default defineCard({
  name: "Multiversal Passage",
  colors: [],
  types: ["land"],
  text: "As this land enters, choose a basic land type. Then you may pay 2 life. If you don't, it enters tapped.\nThis land is the chosen type.",
  chooseOnEnter: BASIC_LAND_TYPE_CHOICES,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", mayPayLife: 2 },
      text: "As this land enters, choose a basic land type. Then you may pay 2 life. If you don't, it enters tapped.",
    },
    {
      affects: { scope: "self" },
      setsChosenLandType: true,
      text: "This land is the chosen type.",
    },
  ],
});
