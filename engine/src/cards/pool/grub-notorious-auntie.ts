import { defineCard } from "../define.js";

/** The back face of Grub, Storied Matriarch. "You may blight 1" isn't offered
 * without a creature to blight (rule 701.68b); "the blighted creature" is the
 * one the counter went on (701.68c), which the blight's `then` reads as its
 * target 0 — copied as it is now, even at 0 toughness: it dies only once the
 * ability has resolved (the ruling). The copy's end-step sacrifice is a copy
 * exception (707.9a), so a copy of the token has it too; "the end step" is
 * every player's. */
const ATTACK_TEXT =
  'Whenever Grub attacks, you may blight 1. If you do, create a tapped and attacking token that\'s a copy of the blighted creature, except it has "At the beginning of the end step, sacrifice this token."';
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {B}. If you do, transform Grub.";

export default defineCard({
  name: "Grub, Notorious Auntie",
  art: "https://cards.scryfall.io/art_crop/back/1/f/1f51adf8-8234-4dae-aedf-7633310d5111.jpg",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${ATTACK_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 1 to copy the blighted creature, tapped and attacking?",
        effect: {
          kind: "blight",
          amount: 1,
          then: {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            tapped: true,
            attacking: "choose",
            exceptions: {
              triggered: [
                {
                  trigger: { on: "step-begins", step: "end", who: "any" },
                  targets: [],
                  effect: { kind: "sacrifice-source" },
                  resolve: null,
                  text: "At the beginning of the end step, sacrifice this token.",
                },
              ],
            },
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      // Won't transform her if she has transformed since it triggered (the
      // ruling; rule 701.28f).
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to transform Grub?",
        cost: "{B}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Grub, Storied Matriarch", "Grub, Notorious Auntie"],
  transform: true,
});
