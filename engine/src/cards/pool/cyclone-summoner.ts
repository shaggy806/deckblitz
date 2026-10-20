import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 7297.
//
// "If you cast it from your hand" is an intervening-if (rule 603.4) read off how this permanent
// entered. Cyclone Summoner is itself a Giant Wizard, so it stays.
const TEXT =
  "When this creature enters, if you cast it from your hand, return all permanents to their owners' hands except for Giants, Wizards, and lands.";

export default defineCard({
  name: "Cyclone Summoner",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 7,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "return-to-hand-all",
        filter: { notTypes: ["land"], notSubtypes: ["Giant", "Wizard"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
