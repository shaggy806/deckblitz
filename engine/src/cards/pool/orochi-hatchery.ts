import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 10764. Astral Cornucopia's X charge
// counters, and Hooded Hydra's one Snake per counter, counted as it resolves.

const ENTER = "This artifact enters with X charge counters on it.";
const MAKE = "{5}, {T}: Create a 1/1 green Snake creature token for each charge counter on this artifact.";

export default defineCard({
  name: "Orochi Hatchery",
  manaCost: "{X}{X}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER}\n${MAKE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: "x" } },
      text: ENTER,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Snake Token", count: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: MAKE,
    },
  ],
});
