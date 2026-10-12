import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloudbound Moogle",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Moogle"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: "Flying\nWhen this creature enters, put a +1/+1 counter on target creature.\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on target creature.",
    },
  ],
});
