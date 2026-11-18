import { defineCard } from "../define.js";

const SHUFFLE_TEXT =
  "{1}{U}: This creature's owner shuffles it into their library. If that player does, they reveal cards from the top of that library until a card named Mirror-Mad Phantasm is revealed. The player puts that card onto the battlefield and all other cards revealed this way into their graveyard.";

// EDHREC rank 14761. Its owner's library, whoever controls it (its ruling),
// and the card found enters under that player's control. A token or a copy
// finds no card of the name, and the whole library goes to the graveyard (the
// ruling); a creature that gained the ability still looks for one named
// Mirror-Mad Phantasm (the ruling) — the name is the card's, not "~".
export default defineCard({
  name: "Mirror-Mad Phantasm",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${SHUFFLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-into-library", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "shuffled-into-library" },
            then: {
              kind: "reveal-until",
              whose: { ownerOf: "source" },
              filter: { name: "Mirror-Mad Phantasm" },
              put: "battlefield",
              rest: "graveyard",
            },
          },
        ],
      },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
