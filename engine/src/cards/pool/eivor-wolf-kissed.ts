import { defineCard } from "../define.js";

// "That many" is the combat damage dealt (its trigger value). Up to one Saga
// card and up to one land card from among the milled ones, onto the
// battlefield together (`oneEach`); Urza's Saga may fill either slot.

const TEXT =
  "Whenever Eivor deals combat damage to a player, you mill that many cards. You may put a Saga card and/or a land card from among them onto the battlefield.";

export default defineCard({
  name: "Eivor, Wolf-Kissed",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Warrior"],
  power: 7,
  toughness: 6,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: { triggerValue: true } },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 2,
            filter: { thisWay: "milled" },
            together: {
              oneEach: [
                { label: "a Saga card", filter: { subtype: "Saga" } },
                { label: "a land card", filter: { type: "land" } },
              ],
              text: "a Saga card and/or a land card",
            },
            destination: "battlefield",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
