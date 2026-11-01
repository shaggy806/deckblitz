import { defineCard } from "../define.js";

const TEXT =
  "{T}: The next instant or sorcery spell you cast this turn costs {X} less to cast, where X is the number of Wizards you control as this ability resolves.";

export default defineCard({
  name: "Kaza, Roil Chaser",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: { countOf: { subtype: "Wizard", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
