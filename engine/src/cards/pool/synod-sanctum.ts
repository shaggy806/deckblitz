import { defineCard } from "../define.js";

// Helvault's linked exile (rule 607.2a) and Cold Storage's return under your
// control (`under: "you"`, rule 110.2a): the cards exiled with this artifact
// in the stint the ability was activated from, though the cost sacrificed it.

const EXILE_TEXT = "{2}, {T}: Exile target permanent you control.";
const RETURN_TEXT =
  "{2}, Sacrifice this artifact: Return all cards exiled with this artifact to the battlefield under your control.";

export default defineCard({
  name: "Synod Sanctum",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield", under: "you" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
