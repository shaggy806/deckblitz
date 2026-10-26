import { defineCard } from "../define.js";

// Creeping Chill's trigger (it works only from the graveyard it was put
// into), with Boneyard Scourge's return of the card itself.
export default defineCard({
  name: "Narcomoeba",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this card is put into your graveyard from your library, you may put it onto the battlefield.",
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "put-into-graveyard", who: "self", from: "library" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put Narcomoeba onto the battlefield?",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: "When this card is put into your graveyard from your library, you may put it onto the battlefield.",
    },
  ],
});
