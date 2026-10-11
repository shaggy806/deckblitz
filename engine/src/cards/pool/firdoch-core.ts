import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Changeling on a kindred artifact: every creature type, and still every one
// as a 4/4 creature (rule 702.73a). The animation sets its base P/T (the
// ruling: later P/T-setting effects overwrite it, modifiers apply on top).

const MANA = "{T}: Add one mana of any color.";
const ANIMATE = "{4}: This artifact becomes a 4/4 artifact creature until end of turn.";

export default defineCard({
  name: "Firdoch Core",
  manaCost: "{3}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${MANA}\n${ANIMATE}`,
  activated: [
    addManaAbility({ mana: "any-color", text: MANA }),
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
