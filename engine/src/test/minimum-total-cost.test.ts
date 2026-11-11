import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, life, named, quiet, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

// A floor on a spell's total cost, applied once the total is determined
// (rule 601.2f's "effects that directly affect the total cost"):
// `costModification.minimumMana` — Trinisphere.

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): readonly CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const tapped = (game: Game, name: string): number => named(game, name, A).filter((id) => game.state.objects[id].tapped).length;

describe("Trinisphere — each spell that would cost less than three mana costs three", () => {
  it("a one-mana spell costs three, the extra paid with any mana", () => {
    const short = table();
    spawn(short.game, "Trinisphere", B);
    lands(short.game, "Mountain", 2);
    const bolt = toHand(short.game, "Lightning Bolt");
    expect(offers(short.game, bolt)).toEqual([]);
    expect(() => cast(short.game, bolt, { targets: [ref(B)] })).toThrow();

    const { game } = table();
    spawn(game, "Trinisphere", B);
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(tapped(game, "Mountain") + tapped(game, "Island")).toBe(3);
  });

  it("a spell with mana cost {0} costs three", () => {
    const { game } = table();
    spawn(game, "Trinisphere");
    const thopter = toHand(game, "Ornithopter");
    lands(game, "Island", 2);
    expect(offers(game, thopter)).toEqual([]);
    lands(game, "Island", 1);
    cast(game, thopter);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(tapped(game, "Island")).toBe(3);
  });

  it("does nothing while tapped, and nothing to a spell already costing three", () => {
    const { game } = table();
    spawn(game, "Trinisphere", B, { tapped: true });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);

    const three = table();
    spawn(three.game, "Trinisphere", B);
    lands(three.game, "Island", 3);
    const divination = toHand(three.game, "Divination");
    cast(three.game, divination);
    expect(zone(three.game, divination)).toBe("graveyard");
  });

  it("applies after cost reductions (Helm of Awakening takes {1} off first)", () => {
    const { game } = table();
    spawn(game, "Trinisphere", B);
    spawn(game, "Helm of Awakening");
    lands(game, "Island", 2);
    const divination = toHand(game, "Divination"); // {2}{U} → {1}{U} → {2}{U}
    expect(offers(game, divination)).toEqual([]);
    lands(game, "Island", 1);
    cast(game, divination);
    expect(tapped(game, "Island")).toBe(3);
  });

  it("counts an announced X: {X}{R} at X=2 is three already, at X=0 costs three", () => {
    const { game } = table();
    spawn(game, "Trinisphere", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Blaze"), { targets: [ref(B)], x: 2 });
    expect(life(game, B)).toBe(18);
    expect(tapped(game, "Mountain")).toBe(3);

    const zero = table();
    spawn(zero.game, "Trinisphere", B);
    lands(zero.game, "Mountain", 2);
    expect(() => cast(zero.game, toHand(zero.game, "Blaze"), { targets: [ref(B)], x: 0 })).toThrow();
    const over = table();
    spawn(over.game, "Trinisphere", B);
    lands(over.game, "Mountain", 3);
    expect(() => cast(over.game, toHand(over.game, "Blaze"), { targets: [ref(B)], x: 3 })).toThrow();
  });

  it("a spell cast without paying its mana cost costs three (Omniscience)", () => {
    const { game } = table();
    spawn(game, "Trinisphere", B);
    spawn(game, "Omniscience");
    const bear = toHand(game, "Grizzly Bears");
    const free = (): CastOffer | undefined => offers(game, bear).find((a) => a.altCost === true);
    expect(free()).toBeUndefined(); // nothing to pay {3} with; {1}{G} → {2}{G} isn't payable either
    lands(game, "Island", 3);
    const offer = free();
    expect(offer).toBeDefined();
    cast(game, bear, {
      altCost: true,
      ...(offer?.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}),
      ...(offer?.via !== undefined ? { via: offer.via } : {}),
    });
    expect(zone(game, bear)).toBe("battlefield");
    expect(tapped(game, "Island")).toBe(3);
  });

  it("a free cast made during a resolution costs three too (cascade)", () => {
    const board = (islands: number) => {
      const t = table();
      spawn(t.game, "Trinisphere", B);
      lands(t.game, "Forest", 3);
      lands(t.game, "Mountain", 1);
      lands(t.game, "Island", islands);
      const bear = toLibrary(t.game, "Grizzly Bears"); // the cascade's hit, on top
      const elf = toHand(t.game, "Bloodbraid Elf");
      cast(t.game, elf, { settle: false });
      t.game.advanceUntil((s) => s.awaiting?.kind === "cast-now" || quiet(s));
      return { game: t.game, bear, elf };
    };
    const paid = board(3);
    const asked = paid.game.state.awaiting;
    if (asked?.kind !== "cast-now") throw new Error("cascade didn't offer the Bears");
    expect(asked.cards).toEqual([paid.bear]);
    paid.game.dispatch({
      type: "cast-now",
      player: A,
      cast: { type: "cast-spell", player: A, card: paid.bear, targets: [], via: "effect", free: true },
    });
    settle(paid.game);
    expect(zone(paid.game, paid.elf)).toBe("battlefield");
    expect(zone(paid.game, paid.bear)).toBe("battlefield");
    expect(tapped(paid.game, "Island")).toBe(3);

    // Too little left to pay {3} with: a cast that can't be made isn't
    // offered, and the card is bottomed.
    for (const islands of [0, 2]) {
      const broke = board(islands);
      expect(broke.game.state.awaiting).toBeNull();
      expect(zone(broke.game, broke.elf)).toBe("battlefield");
      expect(zone(broke.game, broke.bear)).toBe("library");
      expect(tapped(broke.game, "Island")).toBe(0);
    }
  });

  it("a Phyrexian symbol is one mana of the three, still payable with life (Gut Shot)", () => {
    const { game } = table();
    spawn(game, "Trinisphere", B);
    lands(game, "Island", 2);
    const shot = toHand(game, "Gut Shot"); // {R/P} → {2}{R/P}
    cast(game, shot, { targets: [ref(B)], phyrexianLife: 1 });
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(19);
    expect(tapped(game, "Island")).toBe(2);
  });

  it("two Trinispheres are no dearer than one", () => {
    const { game } = table();
    spawn(game, "Trinisphere", B);
    spawn(game, "Trinisphere");
    lands(game, "Island", 3);
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)] });
    expect(tapped(game, "Island") + tapped(game, "Mountain")).toBe(3);
  });
});
