import { defineCard } from "../define.js";

// The back face of Shrill Howler.
// Makes Eldrazi Horror → "Eldrazi Horror Token".
const EVASION_TEXT = "Creatures with power less than this creature's power can't block it.";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, create a 3/2 colorless Eldrazi Horror creature token.";

export default defineCard({
  name: "Howling Chorus",
  art: "https://cards.scryfall.io/art_crop/back/e/4/e414e208-2e90-4b0d-b107-7a387b3f779b.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 3,
  toughness: 5,
  text: `${EVASION_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Horror Token", count: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["Shrill Howler", "Howling Chorus"],
  transform: true,
});
