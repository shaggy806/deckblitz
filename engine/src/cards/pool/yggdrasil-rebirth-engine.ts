import { defineCard } from "../define.js";

// EDHREC rank 15414. Both exiles are linked to it (rule 607.2a), the put's
// `"exiled-with-source"` reading them.

const PUT_TEXT =
  "{4}, {T}: Put a creature card exiled with Yggdrasil onto the battlefield under your control. It gains haste until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Yggdrasil, Rebirth Engine",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `When Yggdrasil enters, exile all creature cards from your graveyard.\n{T}: Exile the top three cards of your library.\n${PUT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-graveyard", target: "you", filter: { type: "creature" }, linked: true },
      resolve: null,
      text: "When Yggdrasil enters, exile all creature cards from your graveyard.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "exile-from-library", amount: 3, linked: true },
      resolve: null,
      text: "{T}: Exile the top three cards of your library.",
    },
    {
      cost: { mana: "{4}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "stay",
        then: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
});
