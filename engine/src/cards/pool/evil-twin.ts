import { defineCard } from "../define.js";

// The ability is part of the copy effect's exceptions, so anything that copies
// this copy has it too (the rulings; rule 707.9a).
const ABILITY_TEXT = "{U}{B}, {T}: Destroy target creature with the same name as this creature.";

export default defineCard({
  name: "Evil Twin",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text: `You may have this creature enter as a copy of any creature on the battlefield, except it has "${ABILITY_TEXT}"`,
  copyOnEnter: {
    filter: { type: "creature" },
    except: {
      activated: [
        {
          cost: { mana: "{U}{B}", tap: true },
          targets: [{ kind: "permanent", filter: { type: "creature", sameNameAsSource: true } }],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
    },
  },
});
