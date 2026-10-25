import { defineCard } from "../define.js";

// EDHREC rank 8976.

export default defineCard({
  name: "Demon of Dark Schemes",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, all other creatures get -2/-2 until end of turn.\nWhenever another creature dies, you get {E} (an energy counter).\n{2}{B}, Pay {E}{E}{E}{E}: Put target creature card from a graveyard onto the battlefield tapped under your control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters, all other creatures get -2/-2 until end of turn.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: "Whenever another creature dies, you get {E}.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, payEnergy: 4 },
      targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, enterTapped: true },
      resolve: null,
      text: "{2}{B}, Pay {E}{E}{E}{E}: Put target creature card from a graveyard onto the battlefield tapped under your control.",
    },
  ],
});
