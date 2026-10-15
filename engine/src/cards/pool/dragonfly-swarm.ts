import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 13640.
//
// Rulings:
//   [2025-11-21] Dragonfly Swarm's triggered ability checks if there is a Lesson card in your
//     graveyard when it is put on the stack and again when it goes to resolve. If there is no
//     Lesson card in your graveyard when Dragonfly Swarm dies, the ability will not be put on the
//     stack at all.
//
// The power is a characteristic-defining ability (Uurg's `only: "power"`),
// so it works in every zone; the toughness stays the printed 3. The Lesson
// check is an intervening-if (rule 603.4).
const POWER_TEXT = "This creature's power is equal to the number of noncreature, nonland cards in your graveyard.";
const DIES_TEXT = "When this creature dies, if there's a Lesson card in your graveyard, draw a card.";

export default defineCard({
  name: "Dragonfly Swarm",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Dragon", "Insect"],
  power: 0,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying, ward {1} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\n${POWER_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { notTypes: ["creature", "land"], ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    ward({ mana: "{1}" }),
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Lesson" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
