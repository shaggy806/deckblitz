import { defineCard } from "../define.js";

// EDHREC rank 20441. Call a Surprise Witness's shape: the target slot still
// reaches the card once it's on the battlefield. The condition is read after
// it has returned ("then … if"), so a returned artifact creature or Vehicle
// counts as the artifact.

const TEXT =
  "Return target creature or Vehicle card from your graveyard to the battlefield. Then put two +1/+1 counters on that permanent if you control an artifact and an enchantment.";

export default defineCard({
  name: "Okiba Salvage",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
            { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
          ],
        },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
    ],
  },
});
