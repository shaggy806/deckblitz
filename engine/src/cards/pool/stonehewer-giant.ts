import { defineCard } from "../define.js";

// "Attach it to a creature you control": the find (target 0 of the search's
// `then`), onto a creature of yours chosen as this resolves, among those it
// can legally equip (`ontoChosen` — rule 301.5); with none, it stays
// unattached.

const TEXT =
  "{1}{W}, {T}: Search your library for an Equipment card, put it onto the battlefield, attach it to a creature you control, then shuffle.";

export default defineCard({
  name: "Stonehewer Giant",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Equipment" },
        destination: "battlefield",
        min: 0,
        max: 1,
        then: {
          kind: "attach",
          target: 0,
          attachment: 0,
          ontoChosen: {
            filter: { type: "creature", controlledBy: "you" },
            prompt: "Choose a creature you control to attach it to",
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
