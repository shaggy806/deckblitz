import { defineCard } from "../define.js";

// EDHREC rank 15858. Marvel Super Heroes Commander.
//
// Loyal Warhound's intervening-if (rule 603.4), asked as it triggers and as
// it resolves. The sacrifice grant reaches the legendary permanents you
// control as it resolves (rule 611.2c), Hajar, Loyal Bodyguard's shape.
const ENTER_TEXT =
  "When this creature enters, if an opponent controls more lands than you, create a tapped Vibranium token. (It's an artifact with indestructible and \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")";
const SAC_TEXT = "Sacrifice this creature: Legendary permanents you control gain indestructible until end of turn.";

export default defineCard({
  name: "Dora Milaje Elite",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${ENTER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "opponent-controls-more", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Vibranium Token", count: 1, tapped: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { supertype: "legendary", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
