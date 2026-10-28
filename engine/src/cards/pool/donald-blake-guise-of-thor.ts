import { powerUp } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 27987.
//
// Power-up (rule 702.193); "he becomes a God Warrior Hero" replaces his
// creature types for good (`add-types`' `setSubtypes`).

const POWER_UP_TEXT =
  "Power-up — {4}{W}{W}: Put two +1/+1 counters and a flying counter on Donald Blake. He becomes a God Warrior Hero. (He loses all other creature types. Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Donald Blake, Guise of Thor",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 1,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${POWER_UP_TEXT}`,
  activated: [
    powerUp(
      "{4}{W}{W}",
      {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          { kind: "add-counter", target: "source", counter: "flying", amount: 1 },
          { kind: "add-types", target: "source", setSubtypes: ["God", "Warrior", "Hero"], duration: "permanent" },
        ],
      },
      POWER_UP_TEXT,
    ),
  ],
});
