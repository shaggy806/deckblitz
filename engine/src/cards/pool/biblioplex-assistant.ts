import { defineCard } from "../define.js";

// EDHREC rank 14977.

const ENTERS_TEXT =
  "When this creature enters, put up to one target instant or sorcery card from your graveyard on top of your library.";

export default defineCard({
  name: "Biblioplex Assistant",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
        },
      ],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
