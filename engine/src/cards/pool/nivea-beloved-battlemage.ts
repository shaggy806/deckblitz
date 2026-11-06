import { defineCard } from "../define.js";

// Mystery Booster Commander. Gustcloak Harrier's ability for every creature
// you control.
const BLOCKED = "Whenever a creature you control becomes blocked, you may untap it and remove it from combat.";
const AKROMA =
  "{5}{W}{W}{W}, Sacrifice Nivea: Create an Akroma, Angel of Wrath token. (She's a {5}{W}{W}{W} legendary 6/6 Angel creature with flying, first strike, vigilance, trample, haste, and protection from black and from red.)";

export default defineCard({
  name: "Nivea, Beloved Battlemage",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Warrior"],
  power: 3,
  toughness: 1,
  text: `${BLOCKED}\n${AKROMA}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap that creature and remove it from combat?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "trigger-object" },
            { kind: "remove-from-combat", target: "trigger-object" },
          ],
        },
      },
      resolve: null,
      text: BLOCKED,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{W}{W}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Akroma, Angel of Wrath Token", count: 1 },
      resolve: null,
      text: AKROMA,
    },
  ],
});
