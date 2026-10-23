import { defineCard } from "../define.js";

// The enters trigger is Shefet Archfiend's: the creatures there as it
// resolves get -2/-2 (the ruling). The energy trigger counts any other
// creature dying, the Demon's own -2/-2 victims and those dying beside it
// included. The reanimation reaches any graveyard and puts the card under
// your control, tapped.

const ETB_TEXT = "When this creature enters, all other creatures get -2/-2 until end of turn.";
const DIES_TEXT = "Whenever another creature dies, you get {E} (an energy counter).";
const REANIMATE_TEXT =
  "{2}{B}, Pay {E}{E}{E}{E}: Put target creature card from a graveyard onto the battlefield tapped under your control.";

export default defineCard({
  name: "Demon of Dark Schemes",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${DIES_TEXT}\n${REANIMATE_TEXT}`,
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
      text: ETB_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, payEnergy: 4 },
      targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, enterTapped: true },
      resolve: null,
      text: REANIMATE_TEXT,
    },
  ],
});
