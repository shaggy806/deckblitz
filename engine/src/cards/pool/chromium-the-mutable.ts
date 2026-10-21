import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "Discard a card: Until end of turn, Chromium becomes a Human with base power and toughness 1/1, loses all abilities, and gains hexproof. It can't be blocked this turn.";

export default defineCard({
  name: "Chromium, the Mutable",
  manaCost: "{4}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flash", "flying"],
  cantBeCountered: true,
  text: `Flash\nThis spell can't be countered.\nFlying\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      // One effect, so the hexproof and the "can't be blocked" it grants come
      // with its own loss of abilities and aren't lost to it (rule 613.7).
      // "It can't be blocked this turn" is a rule, not an ability (rule
      // 611.2c), so a later loss of abilities can't take it away.
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 1,
            toughness: 1,
            addTypes: [],
            addSubtypes: [],
            setSubtypes: ["Human"],
            loseAbilities: true,
            keywords: ["hexproof"],
            duration: "end-of-turn",
          },
          { kind: "restrict", target: "source", restrictions: ["cant-be-blocked"] },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
