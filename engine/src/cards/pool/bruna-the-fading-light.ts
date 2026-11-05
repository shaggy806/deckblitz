import { defineCard } from "../define.js";

// EDHREC rank 2413. "(Melds with Gisela, the Broken Blade.)" is reminder text:
// melding is Gisela's ability, not this card's.
const CAST_TEXT =
  "When you cast this spell, you may return target Angel or Human creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Bruna, the Fading Light",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Horror"],
  meldCard: true,
  power: 5,
  toughness: 7,
  keywords: ["flying", "vigilance"],
  text: `${CAST_TEXT}\nFlying, vigilance\n(Melds with Gisela, the Broken Blade.)`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", subtypes: ["Angel", "Human"] } }],
      effect: {
        kind: "may",
        prompt: "Return the target Angel or Human creature card to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
