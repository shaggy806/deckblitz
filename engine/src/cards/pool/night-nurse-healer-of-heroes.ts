import { defineCard } from "../define.js";

// EDHREC rank 15145. "From anywhere": milled, discarded, died, a
// resolved permanent spell can't be (a permanent card goes to the
// battlefield), a countered one can — any card put into your graveyard this
// turn that's still there as the same object (rule 400.7).

const ETB =
  "When Night Nurse enters, choose target permanent card in your graveyard that was put there from anywhere this turn. Return it to your hand.";

export default defineCard({
  name: "Night Nurse, Healer of Heroes",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "lifelink"],
  text: `Flash\nLifelink\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            notTypes: ["instant", "sorcery"],
            putIntoGraveyardThisTurn: {},
          },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ETB,
    },
  ],
});
