import { defineCard } from "../define.js";

// The trigger is part of the copy effect's exceptions, so a copy of this copy
// has it (the rulings; rule 707.9a). Declining to copy, it's a plain 3/3 with
// no trigger and enters untapped (rule 707.9e).
const ENTERS_TEXT = "When this creature enters, destroy up to one other target creature with the same name as this creature.";

export default defineCard({
  name: "Callidus Assassin",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Shapeshifter", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\nPolymorphine — You may have this creature enter tapped as a copy of any creature on the battlefield, except it has "${ENTERS_TEXT}"`,
  copyOnEnter: {
    filter: { type: "creature" },
    tapped: true,
    except: {
      triggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [
            {
              kind: "optional",
              of: { kind: "other", of: { kind: "permanent", filter: { type: "creature", sameNameAsSource: true } } },
            },
          ],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: ENTERS_TEXT,
        },
      ],
    },
  },
});
