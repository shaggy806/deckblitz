import { defineCard } from "../define.js";

// EDHREC rank 7775.
//
// "A Villain source": a card's ability in any zone (rule 109.2a), as Jasmine
// Dragon Tea Shop's "Ally source".

const VILLAIN_MANA_TEXT =
  "{T}: Add one mana of any color. Spend this mana only to cast a Villain spell or to activate an ability of a Villain source.";
const CONNIVE_TEXT = "{3}, {T}: Target Villain you control connives. Activate only as a sorcery.";

export default defineCard({
  name: "Villainous Hideout",
  colors: [],
  types: ["land"],
  text:
    `{T}: Add {C}.\n${VILLAIN_MANA_TEXT}\n${CONNIVE_TEXT} ` +
    "(Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: {
          spell: { subtype: "Villain" },
          abilityOf: { subtype: "Villain" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to cast a Villain spell or to activate an ability of a Villain source.",
        },
      },
      resolve: null,
      text: VILLAIN_MANA_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Villain" } }],
      effect: { kind: "connive", target: 0 },
      resolve: null,
      text: CONNIVE_TEXT,
      sorcerySpeed: true,
    },
  ],
});
