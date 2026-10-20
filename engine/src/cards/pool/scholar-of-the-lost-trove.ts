import { defineCard } from "../define.js";

// Torrential Gearhulk's shape, wider: an artifact card may be cast too, and
// only an instant or sorcery spell cast this way is exiled instead of going
// to the graveyard (its ruling) — `exileAfter: "instants-and-sorceries"`.

const ENTER_TEXT =
  "When this creature enters, you may cast target instant, sorcery, or artifact card from your graveyard without paying its mana cost. If an instant or sorcery spell cast this way would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Scholar of the Lost Trove",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery", "artifact"] } },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: "instants-and-sorceries" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
