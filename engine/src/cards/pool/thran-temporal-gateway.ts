import { defineCard } from "../define.js";

export default defineCard({
  name: "Thran Temporal Gateway",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "{4}, {T}: You may put a historic permanent card from your hand onto the battlefield. (Artifacts, legendaries, and Sagas are historic.)",
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        // A historic permanent card: historic, and not an instant or sorcery
        // (a legendary sorcery is historic but no permanent card).
        filter: {
          anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
          notTypes: ["instant", "sorcery"],
        },
      },
      resolve: null,
      text: "{4}, {T}: You may put a historic permanent card from your hand onto the battlefield.",
    },
  ],
});
