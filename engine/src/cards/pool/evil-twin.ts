import { defineCard } from "../define.js";

// EDHREC rank 6969.
//
// The ability is part of the copy's copiable values (the ruling), and "the same
// name as this creature" is read off whatever it copied.

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
