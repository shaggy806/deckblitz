import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 23520.
// Protection from non-Spirit creatures: a protection `filter` (a quality a
// colour or card type can't name — Yawgmoth's "protection from Humans").
const PROTECTION_TEXT = "Protection from non-Spirit creatures";
const SOULSHIFT_TEXT =
  "Soulshift 4 (When this creature dies, you may return target Spirit card with mana value 4 or less from your graveyard to your hand.)";

export default defineCard({
  name: "Harbinger of Spring",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `${PROTECTION_TEXT}\n${SOULSHIFT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { type: "creature", notSubtypes: ["Spirit"] } },
      text: PROTECTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 4 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: SOULSHIFT_TEXT,
    },
  ],
});
