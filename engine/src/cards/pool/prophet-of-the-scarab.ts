import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, draw cards equal to the number of Zombies you control or the number of Zombie cards in your graveyard, whichever is greater.";
const ON_BATTLEFIELD = { countOf: { subtype: "Zombie", controlledBy: "you" } } as const;
const IN_GRAVEYARD = { countInGraveyard: { subtype: "Zombie", ownedBy: "you" } } as const;

export default defineCard({
  name: "Prophet of the Scarab",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // The greater of the two: one, plus what the other has over it.
      effect: { kind: "draw", amount: { sum: [IN_GRAVEYARD, { difference: [ON_BATTLEFIELD, IN_GRAVEYARD] }] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
