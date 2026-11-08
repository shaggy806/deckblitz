import { defineCard } from "../define.js";

// EDHREC rank 13850. "Each of them" is each Insect of the declaration.
const COUNTERS_TEXT = "Vrestin enters with X +1/+1 counters on it.";
const ETB_TEXT = "When Vrestin enters, create X 1/1 green and white Alien Insect creature tokens with flying.";
const ATTACK_TEXT = "Whenever you attack with one or more Insects, put a +1/+1 counter on each of them.";

export default defineCard({
  name: "Vrestin, Menoptra Leader",
  manaCost: "{X}{G}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Insect", "Scout"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${COUNTERS_TEXT}\n${ETB_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: COUNTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Alien Insect Token", count: "x" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtype: "Insect" } },
      targets: [],
      effect: { kind: "add-counter-all", filter: { inSet: "trigger-batch" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
