import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 19370.
//
// "If Firemane Angel is in your graveyard or on the battlefield" is the one
// ability working from both zones, written as two: the battlefield's and the
// graveyard's (`fromGraveyard`), each with its zone as the intervening-if
// and `sameObject`, so an Angel that moves between them before the trigger
// resolves gains nothing (the ruling). The return is Necrosavant's shape.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if Firemane Angel is in your graveyard or on the battlefield, you may gain 1 life.";
const RETURN_TEXT =
  "{6}{R}{R}{W}{W}: Return this card from your graveyard to the battlefield. Activate only during your upkeep.";

export default defineCard({
  name: "Firemane Angel",
  manaCost: "{3}{R}{W}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike\n${UPKEEP_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{R}{R}{W}{W}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-zone", zones: ["battlefield"], sameObject: true },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
