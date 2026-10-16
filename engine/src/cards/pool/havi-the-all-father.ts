import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 8179.
//
// Rulings:
//   [2024-07-05] Use the mana value of the legendary creature that died as it last existed on the
//     battlefield to determine what may be targeted with Havi's last ability.
//   [2024-07-05] If Havi and another legendary creature you control die at the same time, Havi's
//     last ability will trigger for each of them.
//   [2024-07-05] Damage dealt to creatures remains on those creatures until the cleanup step or
//     until an effect removes that damage. If Havi loses indestructible (probably because one or
//     more historic cards in your graveyard left your graveyard) after having been dealt lethal
//     damage earlier in the turn, it will die.
// Historic is the `anyOf` of artifact, legendary and Saga. "Havi or another
// legendary creature you control dies" is two triggers (Scrap Trawler's
// shape), so Havi dying counts whether or not it's still legendary, and the
// "lesser mana value" reads the creature that died as it last existed — the
// trigger object's last-known mana value.

const INDESTRUCTIBLE_TEXT =
  "Havi has indestructible as long as there are four or more historic cards in your graveyard. (Artifacts, legendaries, and Sagas are historic.)";
const SAGE_TEXT =
  "Sage Project — Whenever Havi or another legendary creature you control dies, return target legendary creature card with lesser mana value from your graveyard to the battlefield tapped.";

const LESSER: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: {
    type: "creature",
    supertype: "legendary",
    manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } },
  },
};

export default defineCard({
  name: "Havi, the All-Father",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Warrior"],
  power: 6,
  toughness: 6,
  text: `${INDESTRUCTIBLE_TEXT}\n${SAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 4,
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [LESSER],
      effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      resolve: null,
      text: SAGE_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { supertype: "legendary", type: "creature" },
        otherOnly: true,
      },
      targets: [LESSER],
      effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      resolve: null,
      text: SAGE_TEXT,
    },
  ],
});
