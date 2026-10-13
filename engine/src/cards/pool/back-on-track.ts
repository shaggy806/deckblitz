import { defineCard } from "../define.js";

// EDHREC rank 18407.
//
// The Pilot is made whether or not the card returns (it's a second
// sentence, not "if you do"), but a spell whose only target is illegal as it
// resolves does nothing at all (rule 608.2b).
const TEXT =
  'Return target creature or Vehicle card from your graveyard to the battlefield. Create a 1/1 colorless Pilot creature token with "This token saddles Mounts and crews Vehicles as though its power were 2 greater."';

export default defineCard({
  name: "Back on Track",
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
      { kind: "create-token", token: "Pilot Token", count: 1 },
    ],
  },
});
