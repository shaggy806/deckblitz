import { defineCard } from "../define.js";

const TEXT =
  "Strange new worlds — {4}, {T}: Target opponent exiles the top X cards of their library, where X is the number of differently named lands you control. You may cast an instant or sorcery spell from among them without paying its mana cost. Then that player puts the rest on the bottom of their library in a random order.";

export default defineCard({
  name: "Lieutenant Nyota Uhura",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "exile-from-library",
            whose: 0,
            amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
          },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            free: true,
            spell: { typesAnyOf: ["instant", "sorcery"] },
          },
          { kind: "move-exiled-this-way", to: "library-bottom" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
