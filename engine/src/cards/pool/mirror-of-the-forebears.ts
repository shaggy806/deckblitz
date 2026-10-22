import { defineCard } from "../define.js";

// EDHREC rank 10553.
//
// Rulings:
//   [2017-08-25] If you somehow control a Mirror of the Forebears with no chosen creature type,
//     its activated ability can't be activated.
//   [2017-08-25] Once the second ability of Mirror of the Forebears resolves, it no longer has
//     that ability.
//   [2017-08-25] Mirror of the Forebears copies the printed values of the target creature, plus
//     any copy effects that have been applied to it.
//   [2017-08-25] Mirror of the Forebears becomes an artifact in addition to its other types. This
//     is a copiable value that other effects may copy.
//
// The target's `ofChosenType` reads the type chosen for the Mirror as it
// entered; with none chosen nothing matches, so the ability has no legal
// target and can't be activated (the first ruling). Mirage Mirror's
// `become-copy` on the source, with Saheeli's copiable artifact exception.

const COPY_TEXT =
  "{1}: Until end of turn, this artifact becomes a copy of target creature you control of the chosen type, except it's an artifact in addition to its other types.";

export default defineCard({
  name: "Mirror of the Forebears",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  chooseCreatureTypeOnEnter: true,
  text: `As this artifact enters, choose a creature type.\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", ofChosenType: true } }],
      effect: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn", exceptions: { addTypes: ["artifact"] } },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
