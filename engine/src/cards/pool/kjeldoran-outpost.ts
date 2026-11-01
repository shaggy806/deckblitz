import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const TEXT =
  "If this land would enter, sacrifice a Plains instead. If you do, put this land onto the battlefield. If you " +
  "don't, put it into its owner's graveyard.";

export default defineCard({
  name: "Kjeldoran Outpost",
  types: ["land"],
  text: `${TEXT}\n{T}: Add {W}.\n{1}{W}, {T}: Create a 1/1 white Soldier creature token.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { subtype: "Plains" }, count: 1 } },
      },
      text: TEXT,
    },
  ],
  activated: [
    addManaAbility({ mana: "W", text: "{T}: Add {W}." }),
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: "{1}{W}, {T}: Create a 1/1 white Soldier creature token.",
    },
  ],
});
