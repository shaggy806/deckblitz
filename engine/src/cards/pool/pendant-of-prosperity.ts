import { defineCard } from "../define.js";

// Rulings:
//   In a multiplayer game, if Pendant of Prosperity's owner leaves the game, it leaves the game with
//     them. If its controller leaves the game, it's exiled (assuming that player wasn't also its
//     owner).
//   If you control your own Pendant of Prosperity and activate its last ability, you'll draw a card,
//     then you may put a land card onto the battlefield, then you'll draw a second card, then you may
//     once again put a land card onto the battlefield.
//   Pendant of Prosperity's effect doesn't count as playing a land. It can put a land card onto the
//     battlefield even if you've already played your land for the turn, and even if it's not your
//     turn.
const ENTERS = "This artifact enters under the control of an opponent of your choice.";
const ACTIVATED =
  "{2}, {T}: Draw a card, then you may put a land card from your hand onto the battlefield. This artifact's owner draws a card, then that player may put a land card from their hand onto the battlefield.";

export default defineCard({
  name: "Pendant of Prosperity",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS}\n${ACTIVATED}`,
  choosePlayerOnEnter: "opponent",
  entersUnderChosenPlayer: true,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "land" },
          },
          {
            kind: "for-each-player",
            who: { ownerOf: "source" },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1, who: "that-player" },
                {
                  kind: "look-and-choose",
                  player: "that-player",
                  zone: "hand",
                  min: 0,
                  max: 1,
                  destination: "battlefield",
                  leftover: "stay",
                  filter: { type: "land" },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
