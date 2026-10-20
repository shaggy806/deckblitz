import { defineCard } from "../define.js";

// Adventures in the Forgotten Realms. The enters trigger's "if" is an
// intervening if (its ruling): checked as it triggers and again as it
// resolves, and Acererak gone by then still ventures. The attack trigger asks
// each opponent in turn, then the sacrifices happen at once (rule 101.4, its
// ruling).
const ENTERS_TEXT =
  "When Acererak enters, if you haven't completed Tomb of Annihilation, return Acererak to its owner's hand and venture into the dungeon.";
const ATTACK_TEXT =
  "Whenever Acererak attacks, for each opponent, you create a 2/2 black Zombie creature token unless that player sacrifices a creature of their choice.";

export default defineCard({
  name: "Acererak the Archlich",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 5,
  toughness: 5,
  text: `${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "not", of: { kind: "completed-dungeon", name: "Tomb of Annihilation" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "return-to-hand", target: "source" }, { kind: "venture" }],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDidnt: { kind: "create-token", token: "Zombie Token", count: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
