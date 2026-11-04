/**
 * A library search by several players together (rule 101.4 — Tempt with
 * Discovery's ruling): an `each-player-may` whose effect is a `search-library`
 * asks everyone first, then each who said yes searches, what they find waiting
 * in their library until the last has searched; then it all enters at once and
 * they shuffle. A `for-each-player`'s `choicesHeld` over one is "each player
 * searches" (Field of Ruin), and `shufflesLater` + a `shuffle-library` of
 * `searchers` is "then each player who searched a library this way shuffles",
 * once each (Tempt with Discovery).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  controller,
  D,
  destroy,
  enter,
  grant,
  lands,
  named,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const shuffles = (game: Game, player: PlayerId): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

/** The basic lands on `player`'s side; the deck is all Wastes. */
const wastes = (game: Game, player: PlayerId): number => named(game, "Wastes", player).filter((id) => zone(game, id) === "battlefield").length;

const first = (_view: unknown, eligible: readonly string[]): readonly string[] => eligible.slice(0, 1);

describe("Tempt with Discovery", () => {
  it("asks each opponent first, they search together, and you search once more for each who did", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    lands(game, "Forest", 4);
    const order: string[] = [];
    b.chooseModesFn = () => {
      order.push("B says");
      return [0];
    };
    c.chooseModesFn = () => {
      order.push("C says");
      return [];
    };
    d.chooseModesFn = () => {
      order.push("D says");
      return [0];
    };
    a.chooseFromZoneFn = first as never;
    b.chooseFromZoneFn = ((v: unknown, eligible: readonly string[]) => {
      order.push(`B searches, sees ${wastes(game, B)}+${wastes(game, D)}`);
      return first(v, eligible);
    }) as never;
    c.chooseFromZoneFn = first as never;
    d.chooseFromZoneFn = ((v: unknown, eligible: readonly string[]) => {
      // B's find waits in B's library: nothing of it is on the battlefield yet.
      order.push(`D searches, sees ${wastes(game, B)}+${wastes(game, D)}`);
      return first(v, eligible);
    }) as never;

    cast(game, toHand(game, "Tempt with Discovery"));

    expect(order).toEqual(["B says", "C says", "D says", "B searches, sees 0+0", "D searches, sees 0+0"]);
    expect(wastes(game, B)).toBe(1);
    expect(wastes(game, C)).toBe(0);
    expect(wastes(game, D)).toBe(1);
    // Once of your own, and once for each of the two who did.
    expect(wastes(game, A)).toBe(3);
    // Each who searched shuffles once, however many times they searched.
    expect(shuffles(game, A)).toBe(1);
    expect(shuffles(game, B)).toBe(1);
    expect(shuffles(game, C)).toBe(0);
    expect(shuffles(game, D)).toBe(1);
    expect(game.state.searchShufflesOwed).toBeUndefined();
  });

  it("nobody accepting: one land for you and your shuffle", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 4);
    pickModes(b);
    a.chooseFromZoneFn = first as never;
    cast(game, toHand(game, "Tempt with Discovery"));
    expect(wastes(game, A)).toBe(1);
    expect(wastes(game, B)).toBe(0);
    expect(shuffles(game, A)).toBe(1);
    expect(shuffles(game, B)).toBe(0);
  });

  it("an opponent who searches and finds nothing still counts", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 4);
    pickModes(b, 0);
    b.chooseFromZoneFn = () => [];
    a.chooseFromZoneFn = first as never;
    cast(game, toHand(game, "Tempt with Discovery"));
    expect(wastes(game, B)).toBe(0);
    expect(shuffles(game, B)).toBe(1);
    expect(wastes(game, A)).toBe(2);
  });

  it("can't search: nobody's asked who can't, and you still shuffle (Mindlock Orb)", () => {
    const { game, b } = table();
    spawn(game, "Mindlock Orb");
    lands(game, "Forest", 4);
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    cast(game, toHand(game, "Tempt with Discovery"));
    expect(asked).toBe(0);
    expect(wastes(game, A)).toBe(0);
    expect(shuffles(game, A)).toBe(1);
    expect(shuffles(game, B)).toBe(0);
  });
});

describe("Field of Ruin", () => {
  it("destroys the land, then everyone searches together with no question asked, and shuffles", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const field = spawn(game, "Field of Ruin");
    const tower = spawn(game, "Command Tower", B);
    lands(game, "Forest", 2);
    let asked = 0;
    for (const seat of [a, b, c, d]) {
      seat.chooseModesFn = () => {
        asked += 1;
        return [];
      };
    }
    const sawAtSearch: number[] = [];
    for (const seat of [a, b, c]) seat.chooseFromZoneFn = first as never;
    d.chooseFromZoneFn = ((v: unknown, eligible: readonly string[]) => {
      sawAtSearch.push(wastes(game, A) + wastes(game, B) + wastes(game, C));
      return first(v, eligible);
    }) as never;

    activate(game, field, 1, { targets: [ref(tower)] });

    expect(zone(game, field)).toBe("graveyard");
    expect(zone(game, tower)).toBe("graveyard");
    expect(asked).toBe(0);
    expect(sawAtSearch).toEqual([0]);
    for (const player of [A, B, C, D]) {
      expect(wastes(game, player)).toBe(1);
      expect(shuffles(game, player)).toBe(1);
    }
  });

  it("only offers basic lands, and may find nothing", () => {
    const { game, a, b } = table();
    const field = spawn(game, "Field of Ruin");
    const tower = spawn(game, "Command Tower", B);
    lands(game, "Forest", 2);
    const reliquary = toLibrary(game, "Command Tower");
    const seen = pickFromZone(a);
    b.chooseFromZoneFn = () => [];
    activate(game, field, 1, { targets: [ref(tower)] });
    expect(seen.offered.length).toBeGreaterThan(0);
    expect(seen.offered).not.toContain(reliquary);
    expect(wastes(game, A)).toBe(0);
    expect(shuffles(game, A)).toBe(1);
    expect(shuffles(game, B)).toBe(1);
  });

  it("a target that isn't destroyed still has them search (the ruling)", () => {
    const { game, a, b } = table();
    const field = spawn(game, "Field of Ruin");
    const tower = spawn(game, "Command Tower", B);
    grant(game, tower, "indestructible");
    lands(game, "Forest", 2);
    a.chooseFromZoneFn = first as never;
    b.chooseFromZoneFn = first as never;
    activate(game, field, 1, { targets: [ref(tower)] });
    expect(zone(game, tower)).toBe("battlefield");
    expect(wastes(game, A)).toBe(1);
    expect(wastes(game, B)).toBe(1);
  });

  it("can only target an opponent's nonbasic land", () => {
    const { game } = table();
    const field = spawn(game, "Field of Ruin");
    const own = spawn(game, "Command Tower");
    const basic = spawn(game, "Forest", B);
    lands(game, "Forest", 2);
    expect(() => activate(game, field, 1, { targets: [ref(own)] })).toThrow();
    expect(() => activate(game, field, 1, { targets: [ref(basic)] })).toThrow();
  });
});

describe("the other searches together", () => {
  it("Veteran Explorer: each may fetch up to two, and it all enters once all have chosen", () => {
    const { game, a, b } = table();
    const explorer = spawn(game, "Veteran Explorer");
    pickModes(a, 0);
    pickModes(b, 0);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    let sawOfA = -1;
    b.chooseFromZoneFn = (_view, eligible) => {
      sawOfA = wastes(game, A);
      return eligible.slice(0, 2);
    };
    destroy(game, explorer);
    settle(game);
    expect(sawOfA).toBe(0);
    expect(wastes(game, A)).toBe(2);
    expect(wastes(game, B)).toBe(2);
  });

  it("Veteran Explorer: one who declines doesn't search or shuffle", () => {
    const { game, a, b } = table();
    const explorer = spawn(game, "Veteran Explorer");
    pickModes(a);
    pickModes(b, 0);
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    destroy(game, explorer);
    settle(game);
    expect(wastes(game, A)).toBe(0);
    expect(shuffles(game, A)).toBe(0);
    expect(wastes(game, B)).toBe(2);
    expect(shuffles(game, B)).toBe(1);
  });

  it("a find bound to enter tapped does, once held (Old-Growth Dryads)", () => {
    const { game, b } = table();
    pickModes(b, 0);
    b.chooseFromZoneFn = first as never;
    enter(game, "Old-Growth Dryads");
    settle(game);
    const found = named(game, "Wastes", B).filter((id) => zone(game, id) === "battlefield");
    expect(found).toHaveLength(1);
    expect(game.state.objects[found[0]].tapped).toBe(true);
    expect(controller(game, found[0])).toBe(B);
  });

  it("a find with an 'as this enters' choice stops for it, and the shuffle follows (Hired Giant)", () => {
    const { game, b } = table();
    const vents = toLibrary(game, "Steam Vents", B);
    pickModes(b, 0);
    pickFromZone(b, vents);
    enter(game, "Hired Giant");
    settle(game);
    expect(zone(game, vents)).toBe("battlefield");
    expect(shuffles(game, B)).toBe(1);
    expect(game.state.heldChoices).toBeUndefined();
  });

  it("a find bound for the hand goes as it's found (Noble Benefactor)", () => {
    const { game, a, b } = table();
    const benefactor = spawn(game, "Noble Benefactor");
    pickModes(a, 0);
    pickModes(b);
    a.chooseFromZoneFn = first as never;
    const held = game.state.zones.perPlayer[A].hand.length;
    destroy(game, benefactor);
    settle(game);
    expect(game.state.zones.perPlayer[A].hand).toHaveLength(held + 1);
    expect(shuffles(game, A)).toBe(1);
    expect(shuffles(game, B)).toBe(0);
  });
});
