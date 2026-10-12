import { defineCard } from "../define.js";

// The animation has no duration: it lasts as long as the land stays on the
// battlefield. "If this land isn't a creature" is asked as the ability
// resolves (rule 608.2c); a land that's already a creature gets nothing. No
// colour is named, so it stays colourless. Hall of Storm Giants' shape: the
// granted trigger rides on the same object as the animation.
const C_TEXT = "{T}: Add {C}.";
const ANY_TEXT =
  "{T}, Pay 1 life: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.";
const PUMP_TEXT = "Whenever you cast an instant or sorcery spell, this creature gets +1/+0 until end of turn.";
const ANIMATE_TEXT = `{5}: If this land isn't a creature, it becomes a 2/4 Wizard creature with "${PUMP_TEXT}" It's still a land.`;

export default defineCard({
  name: "Great Hall of the Biblioplex",
  colors: [],
  types: ["land"],
  text: `${C_TEXT}\n${ANY_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: C_TEXT,
    },
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: ANY_TEXT,
    },
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { notTypes: ["creature"] } },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "animate",
              target: "source",
              power: 2,
              toughness: 4,
              addTypes: ["creature"],
              addSubtypes: ["Wizard"],
              duration: "permanent",
            },
            {
              kind: "grant-triggered",
              target: "source",
              duration: "permanent",
              ability: {
                trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
                targets: [],
                effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
                resolve: null,
                text: PUMP_TEXT,
              },
            },
          ],
        },
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
