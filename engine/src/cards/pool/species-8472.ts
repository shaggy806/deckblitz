import { defineCard } from "../define.js";

const ENTER =
  "Strange new worlds — When this creature enters, you gain life equal to the number of differently named lands you control.";
const UNBLOCKABLE = "This creature can't be blocked by artifact creatures.";
const SHIELD = "This creature can't be the target of abilities from artifact sources your opponents control.";

export default defineCard({
  name: "Species 8472",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Beast"],
  power: 7,
  toughness: 5,
  text: `${ENTER}\n${UNBLOCKABLE}\n${SHIELD}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [
    { affects: { scope: "self" }, restrictions: [{ kind: "cant-be-blocked", by: { type: "artifact" } }], text: UNBLOCKABLE },
    {
      affects: { scope: "self" },
      hexproofFrom: { types: ["artifact"], abilitiesOnly: true, notHexproof: true },
      text: SHIELD,
    },
  ],
});
