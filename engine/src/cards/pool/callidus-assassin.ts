import { defineCard } from "../define.js";

// Tapped only as a copy, and the trigger only as a copy (the rulings): `tapped`
// and `except` are the copy's. The trigger is a copiable value (the ruling).
const TRIGGER_TEXT = "When this creature enters, destroy up to one other target creature with the same name as this creature.";
const TEXT = `Polymorphine — You may have this creature enter tapped as a copy of any creature on the battlefield, except it has "${TRIGGER_TEXT}"`;

export default defineCard({
  name: "Callidus Assassin",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Shapeshifter", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
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
          text: TRIGGER_TEXT,
        },
      ],
    },
  },
});
