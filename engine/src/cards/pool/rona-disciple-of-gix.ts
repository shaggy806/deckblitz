import { defineCard } from "../define.js";

export default defineCard({
  name: "Rona, Disciple of Gix",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: "When Rona enters, you may exile target historic card from your graveyard. (Artifacts, legendaries, and Sagas are historic.)\nYou may cast spells from among cards exiled with Rona.\n{4}, {T}: Exile the top card of your library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When Rona enters, you may exile target historic card from your graveyard. (Artifacts, legendaries, and Sagas are historic.)",
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exile the targeted card from your graveyard?",
        effect: { kind: "exile", target: 0, linked: true },
      },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: "You may cast spells from among cards exiled with Rona.",
      playFromExile: { filter: {}, linked: true, castOnly: true },
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      resolve: null,
      text: "{4}, {T}: Exile the top card of your library.",
      targets: [],
      effect: { kind: "exile-from-library", amount: 1, linked: true },
    },
  ],
});
