import type { TriggerSpec } from "../../abilities.js";
import { defineCard } from "../define.js";

const MILL_TEXT =
  "Whenever this creature enters or attacks, you may mill two cards. (You may put the top two cards of your library into your graveyard.)";

// One printed ability with two trigger events, each its own trigger here. The
// ruling — with fewer than two cards in your library you can't choose to mill
// two (rule 701.17b) — is the `may`'s own: it isn't offered then.
const mills = (trigger: TriggerSpec) =>
  ({
    trigger,
    targets: [],
    effect: { kind: "may", prompt: "Mill two cards?", effect: { kind: "mill", target: "you", amount: 2 } },
    resolve: null,
    text: MILL_TEXT,
  }) as const;

export default defineCard({
  name: "Dread Osseosaur",
  art: "https://cards.scryfall.io/art_crop/back/3/d/3d4b61c6-3e88-49f5-9e16-aa8a59653327.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Skeleton", "Horror"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${MILL_TEXT}`,
  triggered: [mills({ on: "enters-battlefield", who: "self" }), mills({ on: "attacks", who: "self" })],
  faces: ["Visage of Dread", "Dread Osseosaur"],
  transform: true,
});
