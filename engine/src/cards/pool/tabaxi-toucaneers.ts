import { defineCard } from "../define.js";

export default defineCard({
  name: "Tabaxi Toucaneers",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Ranger"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nMyriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-other-opponent",
        effect: {
          kind: "may",
          prompt: "Myriad: create a token copy attacking this player?",
          aboutThatPlayer: true,
          effect: {
            kind: "create-token-copy",
            of: "source",
            count: 1,
            tapped: true,
            attacking: { player: "that-player", orTheirPlaneswalker: true },
            exileAtEndOfCombat: true,
          },
        },
      },
      resolve: null,
      text: "Myriad",
    },
  ],
});
