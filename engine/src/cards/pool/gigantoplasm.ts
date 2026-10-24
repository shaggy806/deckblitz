import { defineCard } from "../define.js";

// EDHREC rank 9063.
//
// Rulings:
//   [2015-11-04] The activated ability Gigantoplasm gives itself becomes part of its copiable
//     values. Unless the ability is overwritten by another copy effect, a creature that's a copy
//     of Gigantoplasm will have that ability.
//   [2015-11-04] You can choose not to copy anything. In that case, Gigantoplasm enters the
//     battlefield as a 0/0 Shapeshifter creature, and is probably put into the graveyard
//     immediately.
//   [2015-11-04] If Gigantoplasm isn't a creature (perhaps because it copied a land that had
//     temporarily become a creature), you can still activate the ability "{X}: This creature has
//     base power and toughness X/X." However, this ability won't have any effect, and it won't
//     turn Gigantoplasm into a creature.
//   [2015-11-04] The activated ability overwrites all previous effects that set Gigantoplasm's
//     base power and/or toughness to specific values. Other effects that set its base power and/or
//     toughness that start to apply after the ability resolves (including ones created by
//     subsequent activations of the ability) will overwrite the effect of the ability.
//   [2015-11-04] However, the effect of that ability isn't copiable.
//   [2024-01-12] The activated ability that Gigantoplasm gives itself doesn't have a duration. It
//     lasts until Gigantoplasm leaves the battlefield or another effect overwrites it.

// The ability is a copy exception (rule 707.9b — a copiable value, as Machine
// God's Effigy's mana ability is); its effect sets base P/T in layer 7b with
// no duration (`"permanent"`: for as long as it's on the battlefield) and adds
// no card type, so a noncreature copy stays one.
export default defineCard({
  name: "Gigantoplasm",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text: "You may have this creature enter as a copy of any creature on the battlefield, except it has \"{X}: This creature has base power and toughness X/X.\"",
  copyOnEnter: {
    filter: { type: "creature" },
    except: {
      activated: [
        {
          cost: { mana: "{X}", tap: false },
          targets: [],
          effect: {
            kind: "animate",
            target: "source",
            power: "x",
            toughness: "x",
            addTypes: [],
            addSubtypes: [],
            duration: "permanent",
          },
          resolve: null,
          text: "{X}: This creature has base power and toughness X/X.",
        },
      ],
    },
  },
});
