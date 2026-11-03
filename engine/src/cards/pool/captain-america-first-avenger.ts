import { defineCard } from "../define.js";

// The Equipment is the cost's choice, and how much there is to divide is its
// mana value, so the two are announced together (rule 601.2d): the ability is
// offered once per total. An Equipment of mana value 0 leaves nothing to give
// each target its one (601.2d), so it isn't offered. Nothing can happen between
// the division and the cost, so the order of the two can't be told apart.

const THROW =
  "Throw ... — {3}, Unattach an Equipment from Captain America: He deals damage equal to that Equipment's mana value divided as you choose among one, two, or three targets.";
const CATCH =
  "... Catch — At the beginning of combat on your turn, attach up to one target Equipment you control to Captain America.";

export default defineCard({
  name: "Captain America, First Avenger",
  manaCost: "{R}{W}{U}",
  colors: ["R", "W", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 4,
  toughness: 4,
  text: `${THROW}\n${CATCH}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false, unattach: { filter: { subtype: "Equipment" } } },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
      divided: { total: { manaValueOf: "sacrificed" }, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: THROW,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } } }],
      effect: { kind: "attach", target: "source", attachment: 0 },
      resolve: null,
      text: CATCH,
    },
  ],
});
