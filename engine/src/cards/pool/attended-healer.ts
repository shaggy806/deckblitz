import { defineCard } from "../define.js";

// EDHREC rank 12884.
//
// Rulings:
//   [2020-09-25] An ability that triggers whenever you gain life "for the first time each turn"
//     won't trigger if you gain life during a turn before the permanent with that ability is on
//     the battlefield, even if you gain life again later in the turn.

const LIFE_TEXT = "Whenever you gain life for the first time each turn, create a 1/1 white Cat creature token.";
const LIFELINK_TEXT = "{2}{W}: Another target Cleric gains lifelink until end of turn.";

export default defineCard({
  name: "Attended Healer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 2,
  toughness: 3,
  text: `${LIFE_TEXT}\n${LIFELINK_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "create-token", token: "Cat Token (Arahbo, the First Fang)", count: 1 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "any", filter: { subtype: "Cleric" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK_TEXT,
    },
  ],
});
