import { defineCard } from "../define.js";

// EDHREC rank 15568. Repartee is Informed Inkwright's cast trigger; the flicker
// is S.H.I.E.L.D. Flying Car's, its target optional.

const ENTER_TEXT = "When this creature enters, draw a card. Each player loses 1 life.";
const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, exile up to one target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Conciliator's Duelist",
  manaCost: "{W}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Kor", "Warlock"],
  power: 4,
  toughness: 3,
  text: `${ENTER_TEXT}\n${REPARTEE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
