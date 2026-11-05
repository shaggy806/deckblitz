import { defineCard } from "../define.js";

const ETB_TEXT =
  'When Moira Brown enters, create a colorless Book Equipment artifact token named Wasteland Survival Guide with "Equipped creature gets +1/+1 for each quest counter among permanents you control" and equip {1}.';
const ATTACK_TEXT = "Whenever you attack, put a quest counter on target nonland permanent you control.";

export default defineCard({
  name: "Moira Brown, Guide Author",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wasteland Survival Guide Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", whose: "you", filter: { notTypes: ["land"] } }],
      effect: { kind: "add-counter", target: 0, counter: "quest", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
