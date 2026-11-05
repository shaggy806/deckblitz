import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast an instant or sorcery spell from your hand, you may copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Invocation of the Founders",
  art: "https://cards.scryfall.io/art_crop/back/1/c/1c3f661d-b9f7-48e7-afe3-3eaea1022bc1.jpg",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell?",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Invasion of Arcavios", "Invocation of the Founders"],
  transform: true,
});
