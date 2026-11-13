import { defineCard } from "../define.js";

// EDHREC rank 3351.
// Rulings:
//   [2022-09-09] Serra Paragon's effect doesn't change the timing permissions for casting the
//     permanent spell or playing the land. You must still play the land during your main phase
//     when you have priority and the stack is empty, and it counts as your land play for the turn.
//   [2022-09-09] If you play a land or cast a permanent spell from your graveyard this way, the
//     ability it gains doesn't depend on Serra Paragon staying on the battlefield.
//   [2022-09-09] If you cast a permanent spell this way and it's countered, the spell won't
//     go to the graveyard from the battlefield, so the ability doesn't trigger.
//
// One allowance a turn, shared by the land and the spell (`oncePerTurn`), as
// Kagha's. The granted ability rides on what it let be played: the spell and
// the permanent it becomes, or the land as it enters (`gainsTriggered`).

const PLAY_TEXT =
  "Once during each of your turns, you may play a land from your graveyard or cast a permanent spell with mana value 3 or less from your graveyard. If you do, it gains \"When this permanent is put into a graveyard from the battlefield, exile it and you gain 2 life.\"";
const GAINED_TEXT = "When this permanent is put into a graveyard from the battlefield, exile it and you gain 2 life.";

export default defineCard({
  name: "Serra Paragon",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PLAY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        play: true,
        filter: {
          anyOf: [
            { type: "land" },
            {
              typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
              manaValue: { op: "lte", n: 3 },
            },
          ],
        },
        oncePerTurn: true,
        yourTurnOnly: true,
        gainsTriggered: [
          {
            trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
            targets: [],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: "trigger-object" },
                { kind: "gain-life", amount: 2 },
              ],
            },
            resolve: null,
            text: GAINED_TEXT,
          },
        ],
      },
      text: PLAY_TEXT,
    },
  ],
});
