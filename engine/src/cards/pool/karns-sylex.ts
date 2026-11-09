import { defineCard } from "../define.js";

export default defineCard({
  name: "Karn's Sylex",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "Karn's Sylex enters tapped.\nPlayers can't pay life to cast spells or to activate abilities that aren't mana abilities.\n{X}, {T}, Exile Karn's Sylex: Destroy each nonland permanent with mana value X or less. Activate only as a sorcery.",
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text: "Karn's Sylex enters tapped." },
    { affects: { scope: "self" }, prohibits: [{ act: "pay-life", who: "each-player", except: ["mana"] }], text: "Players can't pay life to cast spells or to activate abilities that aren't mana abilities." },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true, do: { kind: "exile", target: "source" } },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "destroy-all", filter: { notTypes: ["land"], manaValue: { op: "lte", n: "x" } } },
      resolve: null,
      text: "{X}, {T}, Exile Karn's Sylex: Destroy each nonland permanent with mana value X or less. Activate only as a sorcery.",
    },
  ],
});
