import { defineCard } from "../define.js";

export default defineCard({
  name: "Hades, Sorcerer of Eld",
  art: "https://cards.scryfall.io/art_crop/back/7/5/75cf4eb8-33e7-4dfc-b890-a7e3b5c1b9d5.jpg",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: "Vigilance\nEcho of the Lost — During your turn, you may play cards from your graveyard.\nIf a card or token would be put into your graveyard from anywhere, exile it instead.",
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "graveyard", play: true, yourTurnOnly: true },
      text: "Echo of the Lost — During your turn, you may play cards from your graveyard.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you" } },
      text: "If a card or token would be put into your graveyard from anywhere, exile it instead.",
    },
  ],
  faces: ["Emet-Selch, Unsundered", "Hades, Sorcerer of Eld"],
  transform: true,
});
