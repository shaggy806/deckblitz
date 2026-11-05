import { defineCard } from "../define.js";

const TEXT =
  "Whenever Moira deals combat damage to a player, return to the battlefield target creature card in your graveyard that was put there from the battlefield this turn.";

export default defineCard({
  name: "Moira, Urborg Haunt",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
