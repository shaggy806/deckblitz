import { defineCard } from "../define.js";

// Avatar: The Last Airbender (TLA). EDHREC rank 11322.
//
// "Mill cards equal to its power" reads the creature as it last existed on the battlefield (rule
// 608.2h), this Aura's own bonus included. "This card" is the Aura followed into the graveyard it
// went to as its creature died (Angelic Destiny's shape, rule 400.7): one gone from there stays
// where it is. The last sentence is one instruction, so the Aura and the creature card leave the
// graveyard as one event: the creature card is chosen first (`look-and-choose`, `destination:
// "stay"`), then both move together (a `simultaneous` sequence), the Aura even with none chosen
// (`thenAlways`).

const STATIC_TEXT =
  "Enchanted creature gets +1/+1 for each creature card in your graveyard and is an Avatar in addition to its other types.";
const DIES_TEXT =
  "When enchanted creature dies, mill cards equal to its power. Return this card to its owner's hand and up to one creature card milled this way to the battlefield under your control.";

export default defineCard({
  name: "Avatar Destiny",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${STATIC_TEXT}\n${DIES_TEXT}`,
  targets: ["creature-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "you" }, pt: [1, 1] },
      addSubtypes: ["Avatar"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: { powerOf: "trigger-object" } },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "stay",
            leftover: "stay",
            filter: { thisWay: "milled", type: "creature" },
            prompt: "Choose up to one creature card milled this way to return to the battlefield",
            thenAlways: true,
            then: {
              kind: "sequence",
              simultaneous: true,
              effects: [
                { kind: "return-to-hand", target: "source", from: "graveyard" },
                { kind: "put-onto-battlefield", target: 0, underYourControl: true },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
