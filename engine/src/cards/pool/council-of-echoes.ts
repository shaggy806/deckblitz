import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Tidecaller Mentor's optional bounce under a
// descend 4 intervening "if" (rule 603.4 — checked as it enters and as it
// resolves, the ruling), and "other than this creature".

const TEXT =
  "Descend 4 — When this creature enters, if there are four or more permanent cards in your graveyard, return up to one target nonland permanent other than this creature to its owner's hand.";

export default defineCard({
  name: "Council of Echoes",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Advisor"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 4,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
