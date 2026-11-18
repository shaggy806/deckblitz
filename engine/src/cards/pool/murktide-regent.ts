import { defineCard } from "../define.js";

// EDHREC rank 15437.
//
// The cards its own delve exiled are linked to the permanent the spell becomes
// (rule 607.2q — `exiledWith`, set as it's cast), so "exiled with it" counts
// them as it enters. A granted delve (Teval) isn't printed, and links nothing.
const ENTERS_TEXT =
  "This creature enters with a +1/+1 counter on it for each instant and sorcery card exiled with it.";
const LEAVES_TEXT = "Whenever an instant or sorcery card leaves your graveyard, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Murktide Regent",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  delve: true,
  text: `Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nFlying\n${ENTERS_TEXT}\n${LEAVES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { aggregate: "count", filter: { typesAnyOf: ["instant", "sorcery"] }, in: "exiled-with-source" },
        },
      },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you", perCard: true, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
