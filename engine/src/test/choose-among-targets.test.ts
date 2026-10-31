/**
 * `choose-among-targets`: a player chooses among a spell's own targets as it
 * resolves — among those still legal (rule 608.2b) — and the chosen and the
 * rest each get their fate: "their controller chooses and sacrifices one of
 * them. Return the other to its owner's hand" (Barrin's Spite), "an opponent
 * chooses one of them. Return that card to your hand. Return the other to
 * the battlefield" (Wake to Slaughter).
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickPermanents,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("choose-among-targets", () => {
  it("Barrin's Spite: their controller picks the one sacrificed, the other is bounced", () => {
    const { game, a, b } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    let alicePicked = false;
    a.choosePermanentsFn = () => {
      alicePicked = true;
      return [];
    };
    const seen = pickPermanents(b, bears);
    cast(game, toHand(game, "Barrin's Spite"), { targets: [ref(bears), ref(giant)] });
    expect(alicePicked).toBe(false);
    expect(seen.offered).toEqual([bears, giant]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("hand");
  });

  it("Barrin's Spite: the two must be controlled by the same player", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant", A);
    expect(() => cast(game, toHand(game, "Barrin's Spite"), { targets: [ref(bears), ref(mine)] })).toThrow();
  });

  it("Incriminate: with one target gone, the other is sacrificed unasked", () => {
    const { game, b } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    let asked = false;
    b.choosePermanentsFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Incriminate"), { targets: [ref(bears), ref(giant)], settle: false });
    destroy(game, bears);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(asked).toBe(false);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Retribution: the opponent's pick is sacrificed, the other gets a -1/-1 counter", () => {
    const { game, b } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(b, giant);
    cast(game, toHand(game, "Retribution"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });

  it("Wake to Slaughter: the chosen opponent picks the card for your hand; the other enters with haste and is exiled at the end step", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const giant = toGraveyard(game, "Hill Giant", A);
    // Alice chooses Carol as the opponent who picks.
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.includes("Carol"))];
    let bobAsked = false;
    b.chooseFromZoneFn = () => {
      bobAsked = true;
      return [];
    };
    const seen = pickFromZone(c, giant);
    cast(game, toHand(game, "Wake to Slaughter"), { targets: [ref(bears), ref(giant)] });
    expect(bobAsked).toBe(false);
    expect(seen.offered).toEqual([bears, giant]);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("exile");
  });

  it("Wake to Slaughter: a single target goes to your hand, unasked", () => {
    const { game, b } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    let asked = false;
    b.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Wake to Slaughter"), { targets: [ref(bears), null] });
    expect(asked).toBe(false);
    expect(zone(game, bears)).toBe("hand");
  });
});
