import { defineCard } from "../define.js";

// EDHREC rank 11631. United Front's shape: the four Heroes are on the
// battlefield by the time the counters go on, so they get one too.
// Makes Hero → "Hero Token (Black Mage's Rod)".
export default defineCard({
  name: "The Crystal's Chosen",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create four 1/1 colorless Hero creature tokens. Then put a +1/+1 counter on each creature you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 4 },
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
    ],
  },
});
