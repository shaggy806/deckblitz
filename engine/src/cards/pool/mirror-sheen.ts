import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 26582.
//
// Rulings:
//   The targeted spell can have any number of targets, as long as you are one of them, and
//   anyone may control it. The copy keeps its targets unless you choose new ones.
//
// Dawn Charm's "spell that targets you" filter on Twincast's copy.

export default defineCard({
  name: "Mirror Sheen",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: "{1}{U/R}{U/R}: Copy target instant or sorcery spell that targets you. You may choose new targets for the copy.",
  activated: [
    {
      cost: { mana: "{1}{U/R}{U/R}", tap: false },
      targets: [{ kind: "spell", filter: { typesAnyOf: ["instant", "sorcery"], targets: { player: "you" } } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: "{1}{U/R}{U/R}: Copy target instant or sorcery spell that targets you. You may choose new targets for the copy.",
    },
  ],
});
