import { defineCard } from "../define.js";

export default defineCard({
  name: "Baxter Stockman",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 3,
  toughness: 3,
  text: "When Baxter Stockman enters, create a 1/1 colorless Robot artifact creature token.\nAt the beginning of combat on your turn, target artifact creature you control gets +3/+0 and gains first strike and vigilance until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Big Mother Mouser)", count: 1 },
      resolve: null,
      text: "When Baxter Stockman enters, create a 1/1 colorless Robot artifact creature token.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target artifact creature you control gets +3/+0 and gains first strike and vigilance until end of turn.",
    },
  ],
});
