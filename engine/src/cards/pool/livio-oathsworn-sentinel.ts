import { defineCard } from "../define.js";

// Commander Legends. EDHREC rank 20558.
//
// The first ability's choice is the creature's controller's, as it resolves
// (an `each-player-may` of `{ controllerOf: 0 }`). The second returns every
// card in exile with an aegis counter on it, whoever exiled it — another
// Livio's too — together, under their owners' control (rule 610.3c).
export default defineCard({
  name: "Livio, Oathsworn Sentinel",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner" },
  text:
    "{1}{W}: Choose another target creature. Its controller may exile it with an aegis counter on it.\n" +
    "{2}{W}, {T}: Return all exiled cards with aegis counters on them to the battlefield under their owners' control.\n" +
    "Partner (You can have two commanders if both have partner.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Exile this creature with an aegis counter on it?",
        effect: { kind: "exile", target: 0, withCounters: { kind: "aegis", amount: 1 } },
      },
      resolve: null,
      text: "{1}{W}: Choose another target creature. Its controller may exile it with an aegis counter on it.",
    },
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield", withCounter: "aegis" },
      resolve: null,
      text: "{2}{W}, {T}: Return all exiled cards with aegis counters on them to the battlefield under their owners' control.",
    },
  ],
});
