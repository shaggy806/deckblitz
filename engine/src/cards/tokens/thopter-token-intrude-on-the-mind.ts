import { defineCard } from "../define.js";

// Intrude on the Mind's 0/0 colorless Thopter artifact creature token with
// flying: it prints 0/0 and gets its size from the +1/+1 counters put on it
// as it's made (`create-token`'s `thenCounters`).

export default defineCard({
  name: "Thopter Token (Intrude on the Mind)",
  art: "22ad97f4-cc41-493c-9848-c06f3cf778c7",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying",
});
