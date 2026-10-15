import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Killmonger enters, you may sacrifice another creature. When you do, destroy target nonland permanent an opponent controls.";
const STATIC_TEXT =
  "As long as there are two or more creature cards in your graveyard, Killmonger gets +2/+1.";

export default defineCard({
  name: "Killmonger, Scourge of Wakanda",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Villain"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      // "When you do" is a reflexive ability (rule 603.12 — Cavalier of
      // Night's shape): the sacrifice happens as this resolves, then the
      // destroy goes on the stack and picks its target.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["nonland-permanent-an-opponent-controls"],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target nonland permanent an opponent controls.",
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { type: "creature" } },
      grantPt: [2, 1],
      text: STATIC_TEXT,
    },
  ],
});
