import { defineCard } from "../define.js";

// EDHREC rank 5398.

export default defineCard({
  name: "Wrexial, the Risen Deep",
  manaCost: "{3}{U}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 5,
  toughness: 8,
  keywords: ["islandwalk", "swampwalk"],
  text: "Islandwalk, swampwalk (This creature can't be blocked as long as defending player controls an Island or a Swamp.)\nWhenever Wrexial deals combat damage to a player, you may cast target instant or sorcery card from that player's graveyard without paying its mana cost. If that spell would be put into a graveyard, exile it instead.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "trigger-player",
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: "Whenever Wrexial deals combat damage to a player, you may cast target instant or sorcery card from that player's graveyard without paying its mana cost. If that spell would be put into a graveyard, exile it instead.",
    },
  ],
});
