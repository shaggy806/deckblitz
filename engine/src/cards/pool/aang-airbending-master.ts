import { defineCard } from "../define.js";

// "Leave the battlefield without dying": to anywhere but a graveyard, once per
// simultaneous event (Dour Port-Mage's trigger). The experience counters are
// the player's, whatever gave them (its rulings).
const AIRBEND = "When Aang enters, airbend another target creature. (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)";
const EXPERIENCE = "Whenever one or more creatures you control leave the battlefield without dying, you get an experience counter.";
const ALLIES = "At the beginning of your upkeep, create a 1/1 white Ally creature token for each experience counter you have.";

export default defineCard({
  name: "Aang, Airbending Master",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Ally"],
  power: 4,
  toughness: 4,
  text: `${AIRBEND}\n${EXPERIENCE}\n${ALLIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "exile", target: 0, airbend: true },
      resolve: null,
      text: AIRBEND,
    },
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        to: ["exile", "hand", "library", "command"],
        batched: true,
      },
      targets: [],
      effect: { kind: "add-player-counters", counter: "experience", amount: 1 },
      resolve: null,
      text: EXPERIENCE,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: { playerCounters: "experience" } },
      resolve: null,
      text: ALLIES,
    },
  ],
});
