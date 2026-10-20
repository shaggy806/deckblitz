/**
 * Snow mana (rule 107.4h): an `{S}` in a cost is paid with one mana of any
 * type made by a snow source, which no generic reduction touches; and "the
 * amount of {S} spent" is the mana from snow sources spent to cast a spell.
 * Kaldheim's cards (B112), written from the rule and their rulings.
 */
import { describe, expect, it } from "vitest";

import { parseManaCost, manaValue } from "../mana.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("{S} in a cost", () => {
  it("parses as its own pip, one toward mana value", () => {
    const cost = parseManaCost("{1}{S}{S}");
    expect(cost.snow).toBe(2);
    expect(cost.generic).toBe(1);
    expect(manaValue(cost)).toBe(3);
  });

  it("can't be paid with mana from a source that isn't snow", () => {
    const { game } = table();
    const valkyrie = spawn(game, "Hailstorm Valkyrie");
    lands(game, "Swamp", 4);
    expect(() => activate(game, valkyrie, 0)).toThrow();
    expect(pt(game, valkyrie)).toEqual({ power: 2, toughness: 2 });
  });

  it("is paid with mana from snow sources, of any type", () => {
    const { game } = table();
    const valkyrie = spawn(game, "Hailstorm Valkyrie");
    lands(game, "Snow-Covered Island", 1);
    lands(game, "Snow-Covered Forest", 1);
    activate(game, valkyrie, 0);
    expect(pt(game, valkyrie)).toEqual({ power: 4, toughness: 4 });
  });

  it("one snow source pays the {S} and an ordinary one the generic, whichever order they're found in", () => {
    const { game } = table();
    const draugr = spawn(game, "Grim Draugr");
    lands(game, "Swamp", 1);
    lands(game, "Snow-Covered Swamp", 1);
    activate(game, draugr, 0);
    expect(pt(game, draugr)).toEqual({ power: 4, toughness: 2 });
  });

  it("two pips need two snow sources: one snow land and an ordinary one can't pay {S}{S}", () => {
    const { game } = table();
    const troll = spawn(game, "Icehide Troll");
    lands(game, "Snow-Covered Forest", 1);
    lands(game, "Forest", 3);
    expect(() => activate(game, troll, 0)).toThrow();
  });

  it("a snow land pays its own ability's {S} (Faceless Haven)", () => {
    const { game } = table();
    const [haven] = [spawn(game, "Faceless Haven")];
    lands(game, "Snow-Covered Plains", 2);
    activate(game, haven, 1);
    expect(pt(game, haven)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("the amount of {S} spent to cast a spell", () => {
  it("Tundra Fumarole adds {C} for each snow mana spent — and keeps it as steps end", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Snow-Covered Mountain", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Tundra Fumarole"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    const pool = game.state.players[A].manaPool;
    expect(pool.filter((u) => u.type === "C")).toHaveLength(2);
    expect(pool.every((u) => u.persists === true)).toBe(true);
  });

  it("cast without snow mana, it adds none", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Tundra Fumarole"), { targets: [ref(bears)] });
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });

  it("Blood on the Snow returns a card of mana value up to the snow mana spent — a destroyed one too", () => {
    const { game, a } = table();
    lands(game, "Snow-Covered Swamp", 3);
    lands(game, "Swamp", 3);
    const knight = spawn(game, "Gray Merchant of Asphodel"); // mana value 5
    const giant = toGraveyard(game, "Hill Giant"); // mana value 4
    const bears = spawn(game, "Grizzly Bears"); // mana value 2, destroyed by the spell
    a.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toContain(bears);
      expect(eligible).not.toContain(giant);
      expect(eligible).not.toContain(knight);
      return [bears];
    };
    cast(game, toHand(game, "Blood on the Snow"), { modes: [0] });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(knight);
  });

  it("Berg Strider: with snow mana spent, the tapped permanent doesn't untap next; without it, it does", () => {
    for (const snow of [true, false]) {
      const { game, a } = table();
      lands(game, snow ? "Snow-Covered Island" : "Island", 5);
      const bears = spawn(game, "Grizzly Bears", B);
      pickTargets(a, bears);
      cast(game, toHand(game, "Berg Strider"));
      settle(game);
      expect(game.state.objects[bears].tapped).toBe(true);
      expect(game.state.objects[bears].skipsNextUntap === true).toBe(snow);
    }
  });

  it("Graven Lore scries X, X the snow mana spent", () => {
    const { game, a } = table();
    lands(game, "Snow-Covered Island", 2);
    lands(game, "Island", 3);
    let looked = -1;
    a.chooseScryFn = (_view, cards) => {
      looked = cards.length;
      return [];
    };
    const before = hand(game, A).length;
    cast(game, toHand(game, "Graven Lore"));
    expect(looked).toBe(2);
    expect(hand(game, A).length).toBe(before + 3);
  });
});

describe("Search for Glory", () => {
  it("finds a snow permanent, legendary or Saga card, and gains 1 life per snow mana spent", () => {
    const { game, a } = table();
    lands(game, "Snow-Covered Plains", 2);
    lands(game, "Plains", 1);
    const before = game.state.players[A].life;
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Search for Glory"));
    expect(game.state.players[A].life).toBe(before + 2);
  });
});
