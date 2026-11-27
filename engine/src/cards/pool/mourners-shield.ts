import { defineCard } from "../define.js";

// Fifth Dawn. EDHREC rank 27621.
//
// Mirror Golem's imprint, then a shield from a source of your choice among
// those that share a color with the card exiled with this artifact
// (`sharesColorWith: "exiled-with-source"`, rule 607.2a), to anything.
// Nothing exiled, and no source shares a color with it.

const IMPRINT_TEXT = "Imprint — When this artifact enters, you may exile target card from a graveyard.";
const SHIELD_TEXT =
  "{2}, {T}: Prevent all damage that would be dealt this turn by a source of your choice that shares a color with the exiled card.";

export default defineCard({
  name: "Mourner's Shield",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${IMPRINT_TEXT}\n${SHIELD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "may",
        prompt: "Exile target card from a graveyard?",
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { sharesColorWith: "exiled-with-source" },
        to: "any",
        amount: "all",
      },
      resolve: null,
      text: SHIELD_TEXT,
    },
  ],
});
