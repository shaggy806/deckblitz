/**
 * The greatest among the cards discarded this way: Jace's Archivist's number of
 * cards a player discarded (Windfall's `perPlayer`), and the greatest mana value
 * of Scythe Specter and Ill-Timed Explosion (`greatestOf`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  lands,
  life,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Jace's Archivist", () => {
  it("has each player discard their hand and draw the most anyone discarded", () => {
    const { game } = table({ players: 3 });
    const archivist = spawn(game, "Jace's Archivist");
    lands(game, "Island", 1);
    // Bob has two more cards than Alice; everyone starts with the same hand.
    toHand(game, "Opt", B);
    toHand(game, "Opt", B);
    const sizes = { a: hand(game, A).length, b: hand(game, B).length, c: hand(game, C).length };
    const most = Math.max(sizes.a, sizes.b, sizes.c);
    const before = graveyard(game, B).length;
    activate(game, archivist, 0);
    expect(hand(game, A).length).toBe(most);
    expect(hand(game, B).length).toBe(most);
    expect(hand(game, C).length).toBe(most);
    expect(graveyard(game, B).length).toBe(before + sizes.b);
    expect(game.state.objects[archivist].tapped).toBe(true);
  });

  it("takes its tap and {U}", () => {
    const { game } = table();
    const archivist = spawn(game, "Jace's Archivist", A, { sick: true });
    lands(game, "Island", 1);
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === archivist)).toBe(false);
  });
});

describe("Scythe Specter", () => {
  /** Alice's Specter connects with Bob, each opponent discarding its card. */
  function connect(players: 3 | 4, discards: Partial<Record<"b" | "c" | "d", string>>) {
    const t = table({ players });
    const { game, a } = t;
    const specter = spawn(game, "Scythe Specter");
    const chosen: Record<string, ObjectId | undefined> = {};
    for (const [seat, player] of [
      ["b", B],
      ["c", C],
      ["d", D],
    ] as const) {
      const name = discards[seat];
      if (name === undefined) continue;
      const card = toHand(game, name, player);
      chosen[seat] = card;
      t[seat].chooseDiscardsFn = () => [card];
    }
    attack(game, a, [specter]);
    settle(game);
    return { ...t, chosen };
  }

  it("makes the one who discarded the greatest mana value lose that much, the others nothing", () => {
    const { game, chosen } = connect(3, { b: "Grizzly Bears", c: "Lightning Bolt" });
    // Combat damage first: 4 to Bob, then Bears' 2.
    expect(life(game, B)).toBe(20 - 4 - 2);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
    expect(zone(game, chosen.b!)).toBe("graveyard");
    expect(zone(game, chosen.c!)).toBe("graveyard");
  });

  it("makes everyone tied for the greatest lose it", () => {
    const { game } = connect(4, { b: "Grizzly Bears", c: "Elvish Mystic", d: "Grizzly Bears" });
    expect(life(game, B)).toBe(20 - 4 - 2);
    expect(life(game, C)).toBe(20);
    expect(life(game, D)).toBe(18);
  });

  it("the opponent attacked needn't be the one who loses life", () => {
    const { game } = connect(3, { b: "Lightning Bolt", c: "Grizzly Bears" });
    expect(life(game, B)).toBe(20 - 4);
    expect(life(game, C)).toBe(18);
  });

  it("with lands alone the greatest is 0, and nobody loses anything", () => {
    const { game } = connect(3, { b: "Forest", c: "Forest" });
    expect(life(game, B)).toBe(20 - 4);
    expect(life(game, C)).toBe(20);
  });
});

describe("Ill-Timed Explosion", () => {
  it("draws two, and on discarding two deals the greatest mana value among them to each creature", () => {
    const { game, a } = table();
    const big = spawn(game, "Colossal Dreadmaw", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const explosion = toHand(game, "Ill-Timed Explosion");
    const bears = toHand(game, "Grizzly Bears");
    const opt = toHand(game, "Opt");
    a.chooseModesFn = () => [0];
    a.chooseDiscardsFn = () => [bears, opt];
    const before = hand(game, A).length;
    cast(game, explosion);
    // Explosion left; two drawn; two discarded.
    expect(hand(game, A).length).toBe(before - 1 + 2 - 2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, opt)).toBe("graveyard");
    expect(damage(game, big)).toBe(2);
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("deals nothing if you don't discard", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Ill-Timed Explosion"));
    expect(hand(game, A).length).toBe(before + 2);
    expect(damage(game, mine)).toBe(0);
  });
});
