import { defineCard } from "../define.js";

// EDHREC rank 13575. The returned creature can't attack or block for as long
// as you control this creature; if it left before the trigger resolved, the
// restriction never begins (the ruling, rule 611.2b).
const ETB_TEXT =
  "When this creature enters, return target creature card with mana value 2 or less from your graveyard to the battlefield. That creature can't attack or block for as long as you control this creature.";

export default defineCard({
  name: "Extraction Specialist",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"], duration: "while-you-control-source" },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
