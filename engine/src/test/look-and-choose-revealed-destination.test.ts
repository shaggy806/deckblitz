/**
 * A card chosen from a look, its destination decided after (Break Out), and a
 * reveal another player chooses from (Thran Tome).
 *
 * Break Out: "Look at the top six cards of your library. You may reveal a
 * creature card from among them. If that card has mana value 2 or less, you
 * may put it onto the battlefield and it gains haste until end of turn. If you
 * didn't put the revealed card onto the battlefield this way, put it into your
 * hand. Put the rest on the bottom of your library in a random order."
 *
 * Thran Tome: "{5}, {T}: Reveal the top three cards of your library. Target
 * opponent chooses one of those cards. Put that card into your graveyard, then
 * draw two cards."
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, enter, graveyard, hand, keywords, lands, named, nextTurn, pickFromZone, pickModes, ref, table, toHand, toLibrary, zone } from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], player = A) => game.state.zones.perPlayer[player].library;

describe("Break Out", () => {
  it("puts a creature card of mana value 2 or less onto the battlefield with haste, the rest on the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, bears);
    pickModes(a, 0);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Break Out"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(named(game, "Grizzly Bears")).toEqual([bears]);
    expect(keywords(game, bears).has("haste")).toBe(true);
    // The other five went to the bottom: the giant is no longer on top.
    const lib = library(game);
    expect(lib.slice(-5)).toContain(giant);
    nextTurn(game);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });

  it("puts the revealed card into the hand when its controller declines the battlefield", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    pickModes(a);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Break Out"));
    expect(zone(game, bears)).toBe("hand");
    expect(named(game, "Grizzly Bears")).toEqual([]);
  });

  it("puts a creature card of mana value 3 or more into the hand, never asking about the battlefield", () => {
    const { game, a } = table();
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant);
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Break Out"));
    expect(asked).toBe(false);
    expect(zone(game, giant)).toBe("hand");
  });

  it("offers only creature cards, and with none revealed puts all six on the bottom", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(a);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Break Out"));
    expect(seen.offered).not.toContain(top);
    expect(zone(game, top)).toBe("library");
    expect(library(game).slice(-6)).toContain(top);
    expect(hand(game).length).toBe(before);
  });
});

describe("Thran Tome", () => {
  it("lets the target opponent choose the revealed card that goes to the graveyard, then draws the other two", () => {
    const { game, b } = table();
    const tome = enter(game, "Thran Tome");
    const third = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(b, second);
    lands(game, "Wastes", 5);
    activate(game, tome, 0, { targets: [ref(B)] });
    expect([...seen.offered].sort()).toEqual([first, second, third].sort());
    expect(graveyard(game)).toContain(second);
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, third)).toBe("hand");
  });
});
