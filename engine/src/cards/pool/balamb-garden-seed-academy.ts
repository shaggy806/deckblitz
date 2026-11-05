import { defineCard } from "../define.js";

// EDHREC rank 6304.

export default defineCard({
  name: "Balamb Garden, SeeD Academy",
  colors: [],
  types: ["land"],
  subtypes: ["Town"],
  text: "This land enters tapped.\n{T}: Add {G} or {U}.\n{5}{G}{U}, {T}: Transform this land. This ability costs {1} less to activate for each other Town you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {U}.",
    },
    {
      cost: { mana: "{5}{G}{U}", tap: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{G}{U}, {T}: Transform this land. This ability costs {1} less to activate for each other Town you control.",
      costReduction: {
        reduceGeneric: { countOf: { subtype: "Town", controlledBy: "you" }, excludeSelf: true },
      },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Balamb Garden, SeeD Academy", "Balamb Garden, Airborne"],
  transform: true,
});
