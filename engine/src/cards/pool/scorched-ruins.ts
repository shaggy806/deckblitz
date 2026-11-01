import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const TEXT =
  "If this land would enter, sacrifice two untapped lands instead. If you do, put this land onto the battlefield. " +
  "If you don't, put it into its owner's graveyard.";

export default defineCard({
  name: "Scorched Ruins",
  types: ["land"],
  text: `${TEXT}\n{T}: Add {C}{C}{C}{C}.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { type: "land", tapped: false }, count: 2 } },
      },
      text: TEXT,
    },
  ],
  activated: [addManaAbility({ mana: "C", amount: 4, text: "{T}: Add {C}{C}{C}{C}." })],
});
