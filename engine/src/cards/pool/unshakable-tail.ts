import { investigate } from "../helpers.js";
import { defineCard } from "../define.js";

// Rulings: cards milled together move at once, so several creature cards
// trigger the second ability once; any Clue artifact pays for the last
// ability, a token or not.

const SURVEIL = "When this creature enters and at the beginning of your upkeep, surveil 1.";
const INVESTIGATE =
  "Whenever one or more creature cards are put into your graveyard from your library, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const RETURN = "{2}, Sacrifice a Clue: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Unshakable Tail",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Detective"],
  power: 3,
  toughness: 2,
  text: `${SURVEIL}\n${INVESTIGATE}\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { subtype: "Clue" } } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you", from: "library", filter: { type: "creature" }, batched: true },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: INVESTIGATE,
    },
  ],
});
