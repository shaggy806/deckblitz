import { defineCard } from "../define.js";
import { outlast } from "../helpers.js";

const GRANT_TEXT = "Other Sliver creatures you control have outlast {2}.";

export default defineCard({
  name: "Enduring Sliver",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `Outlast {2} ({2}, {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)\n${GRANT_TEXT}`,
  activated: [outlast("{2}")],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver", excludeSelf: true },
      grantsActivated: [outlast("{2}")],
      text: GRANT_TEXT,
    },
  ],
});
