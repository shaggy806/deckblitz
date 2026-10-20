import { defineCard } from "../define.js";

// Party (rule 700.8): counted as the enters trigger resolves, Squad Commander
// itself (a Warrior) among them if it's still there.
export default defineCard({
  name: "Squad Commander",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Warrior"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, create a 1/1 white Kor Warrior creature token for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nAt the beginning of combat on your turn, if you have a full party, creatures you control get +1/+0 and gain indestructible until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kor Warrior Token", count: { partySize: "you" } },
      resolve: null,
      text: "When this creature enters, create a 1/1 white Kor Warrior creature token for each creature in your party.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "full-party" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, if you have a full party, creatures you control get +1/+0 and gain indestructible until end of turn.",
    },
  ],
});
