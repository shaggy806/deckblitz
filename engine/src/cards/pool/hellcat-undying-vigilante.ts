import { defineCard } from "../define.js";

const DIES_TEXT =
  "When Hellcat dies, return her to the battlefield under her owner's control with a +1/+1 counter on her. She loses all abilities and gains haste.";

export default defineCard({
  name: "Hellcat, Undying Vigilante",
  manaCost: "{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // The returned permanent is the card the ability followed back from
      // the graveyard. "Loses all abilities and gains haste" has no
      // duration, so it lasts as long as she stays (rule 611.2a); the haste
      // is granted after the loss, so she keeps it (rule 613.7).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object", withCounters: { kind: "+1/+1", amount: 1 } },
          { kind: "lose-abilities", target: "trigger-object", duration: "permanent" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "permanent" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
