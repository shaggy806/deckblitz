import { defineCard } from "../define.js";

// "Your first instant or sorcery spell from your graveyard each turn":
// `firstEachTurn` with a filter counts the caster's matching spells this turn
// (`spellsCastThisTurnAs`, each as it was cast), so one cast from the hand
// first doesn't use it up, and one cast from the graveyard before Sevinne
// arrived does (its ruling). `castFrom` + `ownedBy` is "from your graveyard".

const PREVENT_TEXT = "Prevent all damage that would be dealt to Sevinne.";
const COPY_TEXT =
  "Whenever you cast your first instant or sorcery spell from your graveyard each turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Sevinne, the Chronoclasm",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${PREVENT_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        firstEachTurn: true,
        filter: { typesAnyOf: ["instant", "sorcery"], castFrom: "graveyard", ownedBy: "you" },
      },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
