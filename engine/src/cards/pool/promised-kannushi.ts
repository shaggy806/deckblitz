import { defineCard } from "../define.js";

// Saviors of Kamigawa. Soulshift 7 (rule 702.46a) as its dies trigger, Midnight
// Scavengers' graveyard-return shape. A Human Druid, not a Spirit (its ruling),
// so it can't return itself.
const TEXT =
  "Soulshift 7 (When this creature dies, you may return target Spirit card with mana value 7 or less from your graveyard to your hand.)";

export default defineCard({
  name: "Promised Kannushi",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Spirit", manaValue: { op: "lte", n: 7 } } }],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
