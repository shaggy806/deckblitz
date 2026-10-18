import { defineCard } from "../define.js";

// EDHREC rank 18880.

const ENTERS_TEXT =
  "When this creature enters, put up to one target instant or sorcery card from your graveyard on top of your library.";

export default defineCard({
  name: "Meldweb Curator",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 3,
  toughness: 4,
  text: ENTERS_TEXT,
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
