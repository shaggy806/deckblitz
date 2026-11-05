import { defineCard } from "../define.js";

// EDHREC rank 29247.
//
// The target player names the card as this resolves (the ruling). Inside
// `reveal-top`'s `then` slot 0 is the revealed card, whose owner is the target
// player. With an empty library no card is in the slot, so nothing moves and
// the owner read names nobody: no damage (the ruling).

const TEXT =
  "{3}, {T}: Target player chooses a card name, then reveals the top card of their library. If that card has the chosen name, that player puts it into their hand. Otherwise, they put it into their graveyard and this artifact deals 2 damage to them.";

export default defineCard({
  name: "Vexing Arcanix",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["player"],
      effect: {
        kind: "choose-card-name",
        chooser: 0,
        then: {
          kind: "reveal-top",
          of: { ownerOfTarget: 0 },
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { hasName: "$chosenName" } },
            then: { kind: "return-to-hand", target: 0, from: "library" },
            else: {
              kind: "sequence",
              effects: [
                { kind: "put-into-graveyard", target: 0 },
                { kind: "damage", amount: 2, who: { ownerOfTarget: 0 } },
              ],
            },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
