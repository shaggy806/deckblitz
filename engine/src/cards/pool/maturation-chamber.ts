import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const CAST_TEXT = "Whenever you cast an artifact spell, put a charge counter on this artifact.";
const MAKE_TEXT =
  "{4}, {T}: Create a 1/1 colorless Borg artifact creature token for each charge counter on this artifact. Activate only as a sorcery.";

export default defineCard({
  name: "Maturation Chamber",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${CAST_TEXT}\n${MAKE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token", token: "Borg Token", count: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
