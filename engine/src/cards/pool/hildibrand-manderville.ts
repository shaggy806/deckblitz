import { defineCard } from "../define.js";

// EDHREC rank 10267. The dies trigger is Mosswood Dreadknight's: a permission
// over the card in the graveyard whose `spell` filter, read as the face cast
// (601.3e), reaches only the Adventure (715.3a).

const ANTHEM = "Creature tokens you control get +1/+1.";
const DIES = "When Hildibrand Manderville dies, you may cast it from your graveyard as an Adventure until the end of your next turn.";

export default defineCard({
  name: "Hildibrand Manderville",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM}\n${DIES}`,
  static: [{ affects: { scope: "creatures-you-control", tokenOnly: true }, grantPt: [1, 1], text: ANTHEM }],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "grant-play",
        cards: "trigger-object",
        duration: "until-end-of-your-next-turn",
        spell: { subtype: "Adventure" },
      },
      resolve: null,
      text: DIES,
    },
  ],
  faces: ["Hildibrand Manderville", "Gentleman's Rise"],
  adventure: true,
});
