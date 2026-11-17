/**
 * "X target cards from **target player's** graveyard" (Suffer the Past): a
 * group of exactly X (`min`/`max: "x"`) whose members are each a card in the
 * graveyard of the player chosen for slot 0 (`sameController: { slot: 0 }`),
 * X announced before the targets are chosen (rule 601.2b–c). The life moves by
 * the cards actually exiled (the ruling), as one life-gain event.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, life, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const swamps = (game: ReturnType<typeof table>["game"], n: number): void => {
  for (let i = 0; i < n; i++) spawn(game, "Swamp");
};

describe("Suffer the Past", () => {
  it("exiles X cards from the target player's graveyard; they lose that much life and you gain it", () => {
    const { game } = table();
    swamps(game, 3);
    const one = toGraveyard(game, "Grizzly Bears", B);
    const two = toGraveyard(game, "Lightning Bolt", B);
    const kept = toGraveyard(game, "Divination", B);
    cast(game, toHand(game, "Suffer the Past"), { x: 2, targets: [ref(B), ref(one), ref(two)] });
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(graveyard(game, B)).toEqual([kept]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("can't take a card from another player's graveyard than the one targeted", () => {
    const { game } = table();
    swamps(game, 2);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    expect(() => cast(game, toHand(game, "Suffer the Past"), { x: 1, targets: [ref(B), ref(mine)] })).toThrow(/target/i);
    cast(game, toHand(game, "Suffer the Past"), { x: 1, targets: [ref(B), ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("exactly X targets: fewer is refused", () => {
    const { game } = table();
    swamps(game, 3);
    const one = toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Lightning Bolt", B);
    expect(() => cast(game, toHand(game, "Suffer the Past"), { x: 2, targets: [ref(B), ref(one)] })).toThrow(/target/i);
  });

  it("a target player gone illegal loses no life, but the cards are exiled and you gain the life (the ruling)", () => {
    const { game } = table();
    swamps(game, 2);
    const one = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Suffer the Past"), { x: 1, targets: [ref(B), ref(one)], settle: false });
    spawn(game, "Leyline of Sanctity", B);
    settle(game);
    expect(zone(game, one)).toBe("exile");
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(21);
  });

  it("Drafna's Restoration: any number of artifact cards from that player's graveyard onto their library", () => {
    const { game } = table();
    spawn(game, "Island");
    const ring = toGraveyard(game, "Sol Ring", B);
    const stone = toGraveyard(game, "Mind Stone", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Sol Ring", A);
    // A creature card, or an artifact card from another graveyard, isn't one.
    expect(() =>
      cast(game, toHand(game, "Drafna's Restoration"), { targets: [ref(B), ref(ring), ref(bears)] }),
    ).toThrow(/target/i);
    expect(() =>
      cast(game, toHand(game, "Drafna's Restoration"), { targets: [ref(B), ref(ring), ref(mine)] }),
    ).toThrow(/target/i);
    cast(game, toHand(game, "Drafna's Restoration"), { targets: [ref(B), ref(ring), ref(stone)] });
    const library = game.state.zones.perPlayer[B].library;
    expect([...library.slice(0, 2)].sort()).toEqual([ring, stone].sort());
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("the life moves by the cards actually exiled, not by X", () => {
    const { game } = table();
    swamps(game, 3);
    const one = toGraveyard(game, "Grizzly Bears", B);
    const two = toGraveyard(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Suffer the Past"), { x: 2, targets: [ref(B), ref(one), ref(two)], settle: false });
    game.debugMove(two, "hand");
    settle(game);
    expect(zone(game, one)).toBe("exile");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});
