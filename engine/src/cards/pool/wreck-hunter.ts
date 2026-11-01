import { defineCard } from "../define.js";

// EDHREC rank 18532. Counts the nonland cards in the target
// player's graveyard that were put there from the battlefield this turn and
// are still there as it resolves; tokens never are (they cease to exist,
// rule 111.7). The Powerstones are created tapped — that's the effect, not
// the token's definition (the rulings).

const ETB =
  "When this creature enters, choose target player. You create a tapped Powerstone token for each nonland card in that player's graveyard that was put there from the battlefield this turn.";

export default defineCard({
  name: "Wreck Hunter",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB} (It's an artifact with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "create-token",
        token: "Powerstone Token",
        count: {
          countInGraveyard: {
            notTypes: ["land"],
            ownedBy: "you",
            putIntoGraveyardThisTurn: { from: ["battlefield"] },
          },
          forTarget: 0,
        },
        tapped: true,
      },
      resolve: null,
      text: ETB,
    },
  ],
});
