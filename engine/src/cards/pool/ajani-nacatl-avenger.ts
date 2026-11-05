import type { StaticCondition } from "../define.js";
import { defineCard } from "../define.js";

const RED_OTHER: StaticCondition = { kind: "controls", filter: { colors: ["R"] }, atLeast: 1, excludeSelf: true };
const ZERO_TEXT =
  "0: Create a 2/1 white Cat Warrior creature token. When you do, if you control a red permanent other than Ajani, he deals damage equal to the number of creatures you control to any target.";
const REFLEXIVE_TEXT =
  "When you do, if you control a red permanent other than Ajani, he deals damage equal to the number of creatures you control to any target.";

export default defineCard({
  name: "Ajani, Nacatl Avenger",
  art: "https://cards.scryfall.io/art_crop/back/0/d/0d16e8e0-31b2-4389-afd6-783c501f6fa0.jpg",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 3,
  text: `+2: Put a +1/+1 counter on each Cat you control.\n${ZERO_TEXT}\n−4: Each opponent chooses an artifact, a creature, an enchantment, and a planeswalker from among the nonland permanents they control, then sacrifices the rest.`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", subtype: "Cat", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "+2: Put a +1/+1 counter on each Cat you control.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      // The reflexive ability triggers once for each Cat Warrior made this
      // way, and not for a token a replacement made instead (its rulings);
      // its "if" is checked as it triggers and again as it resolves.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Cat Warrior Token (Ajani Fells the Godsire)", count: 1 },
          {
            kind: "for-each-permanent",
            filter: { thisWay: "created", subtype: "Cat", anyOf: [{ subtype: "Warrior" }] },
            effect: {
              kind: "conditional",
              condition: RED_OTHER,
              then: {
                kind: "reflexive-trigger",
                targets: ["any-target"],
                effect: {
                  kind: "conditional",
                  condition: RED_OTHER,
                  then: {
                    kind: "damage",
                    amount: { countOf: { type: "creature", controlledBy: "you" } },
                    target: 0,
                  },
                },
                text: REFLEXIVE_TEXT,
              },
            },
          },
        ],
      },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "choose-one-of-each",
        who: "each-opponent",
        slots: ["artifact", "creature", "enchantment", "planeswalker"],
        filter: { notTypes: ["land"] },
        rest: "sacrifice",
        prompt:
          "Choose an artifact, a creature, an enchantment, and a planeswalker to keep — your other nonland permanents are sacrificed",
      },
      resolve: null,
      text: "−4: Each opponent chooses an artifact, a creature, an enchantment, and a planeswalker from among the nonland permanents they control, then sacrifices the rest.",
    },
  ],
  faces: ["Ajani, Nacatl Pariah", "Ajani, Nacatl Avenger"],
  transform: true,
});
