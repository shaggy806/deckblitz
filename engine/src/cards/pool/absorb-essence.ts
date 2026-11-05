import { defineCard } from "../define.js";

// The Omen half of Purging Stormbrood (rule 720): shuffled into its owner's
// library as it resolves.
export default defineCard({
  name: "Absorb Essence",
  art: "https://cards.scryfall.io/art_crop/back/3/9/3988dc76-072c-4f43-849d-2e73c6f6ff58.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Omen"],
  text: "Target creature gets +2/+2 and gains lifelink and hexproof until end of turn. (Then shuffle this card into its owner's library.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
    ],
  },
  faces: ["Purging Stormbrood", "Absorb Essence"],
  omen: true,
});
