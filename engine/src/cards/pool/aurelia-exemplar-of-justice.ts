import { defineCard } from "../define.js";
import { mentor } from "../helpers.js";

// EDHREC rank 8397. Guilds of Ravnica. The combat trigger's colour checks are
// read as it resolves; +2/+0 comes once whatever the colours (the ruling).

const COMBAT_TEXT =
  "At the beginning of combat on your turn, choose up to one target creature you control. Until end of turn, that creature gets +2/+0, gains trample if it's red, and gains vigilance if it's white.";

export default defineCard({
  name: "Aurelia, Exemplar of Justice",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\n${COMBAT_TEXT}`,
  triggered: [
    mentor(),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { colors: ["R"] } },
            then: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { colors: ["W"] } },
            then: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
