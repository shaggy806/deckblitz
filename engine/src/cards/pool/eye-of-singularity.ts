import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this enchantment enters, destroy each permanent with the same name as another permanent, except for basic lands. They can't be regenerated.";
const WATCH_TEXT =
  "Whenever a permanent other than a basic land enters, destroy all other permanents with that name. They can't be regenerated.";

// The first ability asks each permanent about the whole battlefield before
// anything goes, so a pair goes together (`sameNameAsAnother`, rule 201.2a). The
// second names the permanent as it is or last existed (rule 608.2h) and spares
// only that object, while it's still that object (rule 400.7): two namesakes
// entering together fire two triggers, and the second destroys what the first
// spared.
export default defineCard({
  name: "Eye of Singularity",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${WATCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { sameNameAsAnother: {}, notSupertype: "basic" },
        cantBeRegenerated: true,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { notSupertype: "basic" } },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { sameNameAsTriggerObject: true },
        exceptTriggerObject: true,
        cantBeRegenerated: true,
      },
      resolve: null,
      text: WATCH_TEXT,
    },
  ],
});
