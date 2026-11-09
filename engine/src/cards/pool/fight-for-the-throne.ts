import { defineCard } from "../define.js";

const DELAYED_TEXT =
  "When the creature an opponent controls dies this turn, if you control your commander, you become the monarch.";

export default defineCard({
  name: "Fight for the Throne",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Put a +1/+1 counter on target creature you control. Then it fights target creature an opponent controls. ${DELAYED_TEXT}`,
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1 },
      {
        kind: "delayed-trigger",
        at: { leaves: 1, to: ["graveyard"], thisTurn: true },
        if: { kind: "controls", filter: { isCommander: true, ownedBy: "you" }, atLeast: 1 },
        effect: { kind: "become-monarch" },
        text: DELAYED_TEXT,
      },
    ],
  },
});
