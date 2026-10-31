import { defineCard } from "../define.js";

// The cards found are exiled with this artifact (rule 607.2a), and the
// activated ability picks only among those still in exile. A new Skyship
// Weatherlight (or this one back again) is a new object (rule 400.7) and
// reaches none of them.

const ENTER_TEXT =
  "When Skyship Weatherlight enters, search your library for any number of artifact and/or creature cards, exile them, then shuffle.";
const PICK_TEXT =
  "{4}, {T}: Choose a card at random that was exiled with Skyship Weatherlight. Put that card into its owner's hand.";

export default defineCard({
  name: "Skyship Weatherlight",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: `${ENTER_TEXT}\n${PICK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { typesAnyOf: ["artifact", "creature"] },
        destination: "exile",
        min: 0,
        max: { librarySize: "you" },
        linked: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "exiled-with-source",
        then: { kind: "return-to-hand", target: 0, from: "exile" },
      },
      resolve: null,
      text: PICK_TEXT,
    },
  ],
});
