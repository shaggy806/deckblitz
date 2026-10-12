import { defineCard } from "../define.js";

// The back face of Jennifer Walters, castable on its own.
//
// "Do this only once each turn" is the `may`'s `oncePerTurn` (Leonardo, the
// Balance): each creature dealt damage still triggers it, but once the damage
// has been dealt this way this turn it isn't offered again (a declined one
// doesn't use it up).

const LOCK_TEXT = "Your opponents can't cast spells during your turn.";
const DAMAGE_TEXT =
  "Whenever a creature you control is dealt damage, you may have The Sensational She-Hulk deal that much damage " +
  "to any target. Do this only once each turn.";

export default defineCard({
  name: "The Sensational She-Hulk",
  art: "https://cards.scryfall.io/art_crop/back/6/1/61237530-ad49-469c-a952-67c92315708e.jpg",
  manaCost: "{3}{G}{W}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Hero"],
  power: 6,
  toughness: 6,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${LOCK_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      prohibits: { who: "opponents", spells: true },
      text: LOCK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "you-control", filter: { type: "creature" } },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Have The Sensational She-Hulk deal that much damage?",
        oncePerTurn: true,
        effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["Jennifer Walters", "The Sensational She-Hulk"],
});
