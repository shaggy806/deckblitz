import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 9567.
//
// Champion a Merfolk (rule 702.72): the `champion` helper's two linked
// triggers. The Merfolk sacrificed for the extra turn may be the Prophets
// itself (any Merfolk you control).

export default defineCard({
  name: "Wanderwine Prophets",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 4,
  toughness: 4,
  text: "Champion a Merfolk (When this enters, sacrifice it unless you exile another Merfolk you control. When this leaves the battlefield, that card returns to the battlefield.)\nWhenever this creature deals combat damage to a player, you may sacrifice a Merfolk. If you do, take an extra turn after this one.",
  triggered: [
    ...champion({ subtype: "Merfolk" }, "a Merfolk"),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { subtype: "Merfolk" }, text: "Sacrifice a Merfolk" }],
        ifDid: { kind: "take-extra-turn" },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may sacrifice a Merfolk. If you do, take an extra turn after this one.",
    },
  ],
});
