import { CHOSEN_THIS_WAY } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 10550.
//
// Each player chooses a creature type in turn order from the active player
// (`vote` with `choose`); then each returns any number of cards of **their own**
// type (the ruling) from their graveyard — `for-each-vote` substitutes each
// player's choice for `CHOSEN_THIS_WAY`, and that player picks the cards.
const TEXT =
  "When this creature enters, each player chooses a creature type and returns any number of cards of that type from their graveyard to their hand.";
const OF_THAT_TYPE = { subtypes: [CHOSEN_THIS_WAY] };

export default defineCard({
  name: "Grave Sifter",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Beast"],
  power: 5,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", choose: true, for: { creatureType: true } },
          {
            kind: "for-each-vote",
            effect: {
              kind: "look-and-choose",
              zone: "graveyard",
              player: "that-player",
              filter: OF_THAT_TYPE,
              min: 0,
              max: { countInGraveyard: OF_THAT_TYPE },
              destination: "hand",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
