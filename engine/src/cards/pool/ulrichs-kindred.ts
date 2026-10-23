import { defineCard } from "../define.js";

// EDHREC rank 17915.

const SHIELD_TEXT =
  '{3}{G}: Target attacking Wolf or Werewolf gains indestructible until end of turn. (Damage and effects that say "destroy" don\'t destroy it.)';

export default defineCard({
  name: "Ulrich's Kindred",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${SHIELD_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtypes: ["Wolf", "Werewolf"], attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: SHIELD_TEXT,
    },
  ],
});
