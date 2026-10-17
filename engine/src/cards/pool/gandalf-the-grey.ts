import { defineCard } from "../define.js";

// Rulings: the mode is chosen as the trigger goes on the stack, and still
// counts as chosen if the ability doesn't resolve; "that hasn't been chosen"
// is this one Gandalf, a new object once it leaves and returns (rule 400.7) —
// `notChosenBefore`, as Silent Hallcreeper.
const TRIGGER_TEXT = "Whenever you cast an instant or sorcery spell, choose one that hasn't been chosen —";
const TAP_MODE = "You may tap or untap target permanent.";
const DAMAGE_MODE = "Gandalf deals 3 damage to each opponent.";
const COPY_MODE = "Copy target instant or sorcery spell you control. You may choose new targets for the copy.";
const LIBRARY_MODE = "Put Gandalf on top of its owner's library.";

export default defineCard({
  name: "Gandalf the Grey",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 3,
  toughness: 4,
  text: `${TRIGGER_TEXT}\n• ${TAP_MODE}\n• ${DAMAGE_MODE}\n• ${COPY_MODE}\n• ${LIBRARY_MODE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: TAP_MODE,
            targets: ["permanent"],
            effect: {
              kind: "modal",
              minModes: 0,
              maxModes: 1,
              modes: [
                { text: "Tap it", effect: { kind: "tap", target: 0 } },
                { text: "Untap it", effect: { kind: "untap", target: 0 } },
              ],
            },
          },
          { text: DAMAGE_MODE, effect: { kind: "damage", amount: 3, who: "each-opponent" } },
          {
            text: COPY_MODE,
            targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
            effect: { kind: "copy-spell", target: 0, newTargets: true },
          },
          { text: LIBRARY_MODE, effect: { kind: "put-on-library", target: "source", position: "top" } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${TAP_MODE} ${DAMAGE_MODE} ${COPY_MODE} ${LIBRARY_MODE}`,
    },
  ],
});
