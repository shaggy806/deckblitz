import { defineCard } from "../define.js";

// EDHREC rank 7705.

const TEXT =
  "Whenever an opponent activates an ability of a permanent that isn't a mana ability, you create a 1/1 white Zombie creature token. This ability triggers only once each turn.";

export default defineCard({
  name: "Wizened Mentor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      // "Of a permanent" (`source: {}`): not a card's in a hand or graveyard,
      // but one whose cost sacrificed it still counts. Never a mana ability:
      // those don't use the stack.
      trigger: { on: "activates-ability", who: "opponent", source: {} },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (On Wings of Gold)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
