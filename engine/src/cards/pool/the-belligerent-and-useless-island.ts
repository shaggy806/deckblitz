import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Playtest card (Unknown Event). A legendary artifact land Vehicle Island:
// its "{T}: Add {U}" is the Island type's intrinsic ability (rule 305.6), so
// it isn't authored again. Crewed, it's a 2/2 artifact creature land until
// end of turn; the loot trigger is Gitaxian Mindstinger's, to a player or a
// battle.

const TAPPED_TEXT = "The Belligerent and Useless Island enter the battlefield tapped.";
const LOOT_TEXT =
  "When The Belligerent and Useless Island deal combat damage to a player or battle, draw a card, then discard a card.";

export default defineCard({
  name: "The Belligerent and Useless Island",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "land"],
  subtypes: ["Vehicle", "Island"],
  power: 2,
  toughness: 2,
  text: `({T}: Add {U}.)\n${TAPPED_TEXT}\n${LOOT_TEXT}\n${crewText(2)}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: TAPPED_TEXT,
    },
  ],
  activated: [crew(2, crewText(2))],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
